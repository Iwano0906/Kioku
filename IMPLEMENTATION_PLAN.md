# Kioku 実装計画

`requirements.md` を踏まえた実装計画。まだコードは実装しない。

## 0. 前提となる技術的判断

サムネイル生成について、Cloudflare Workers（Pagesのサーバーサイド実行環境）は
Node.jsのネイティブモジュール（`sharp`等）が動かないランタイムのため、
サーバー側での画像リサイズができない。そのため以下の方式を採用する。

- **アップロード前にブラウザ側（Canvasを使用）でサムネイルを生成**し、
  オリジナル画像とサムネイル画像の2枚をR2にアップロードする
- 将来的に画質を上げたくなった場合はCloudflare Images（有料）への切り替えを検討

## 1. ディレクトリ構成

```
Kioku/
├── package.json
├── next.config.mjs           # Cloudflare Pages向け設定（@cloudflare/next-on-pages）
├── tsconfig.json
├── tailwind.config.ts
├── wrangler.toml              # D1/R2バインディング定義
├── .env.example                # APP_PASSWORD, SESSION_SECRET など
├── migrations/
│   └── 0001_init.sql          # D1スキーマ（photos, tags, photo_tags）
├── middleware.ts               # 未ログイン時に/loginへリダイレクト
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # 共通レイアウト、PWAメタタグ、フォント読込
│   │   ├── globals.css                # Tailwind + レトロ配色のCSS変数
│   │   ├── manifest.ts                # PWAマニフェスト
│   │   ├── login/page.tsx             # ログイン画面
│   │   ├── page.tsx                   # トップ画面（一覧）
│   │   ├── upload/page.tsx            # アップロード画面
│   │   ├── photos/[id]/page.tsx       # 写真詳細・編集画面
│   │   ├── tags/page.tsx              # タグ一覧・絞り込み画面
│   │   ├── map/page.tsx               # 地図画面
│   │   └── api/
│   │       ├── auth/login/route.ts    # POST ログイン（パスワード照合）
│   │       ├── auth/logout/route.ts   # POST ログアウト
│   │       ├── photos/route.ts        # GET一覧 / POST新規登録
│   │       ├── photos/[id]/route.ts   # GET単体 / PATCH編集 / DELETE削除
│   │       ├── upload/route.ts        # POST R2へのファイルアップロード
│   │       └── tags/route.ts          # GET タグ一覧
│   ├── components/
│   │   ├── PhotoCard.tsx              # ポラロイド風の写真カード
│   │   ├── PhotoGrid.tsx              # 一覧のグリッド/タイムライン表示
│   │   ├── UploadForm.tsx             # ファイル選択＋キャプション/タグ入力
│   │   ├── TagFilterBar.tsx           # タグ絞り込みUI
│   │   ├── MapView.tsx                # Leaflet地図（クライアントコンポーネント）
│   │   └── BottomNav.tsx              # モバイル向け下部タブナビ
│   ├── lib/
│   │   ├── db.ts                      # D1操作関数
│   │   ├── r2.ts                      # R2操作関数
│   │   ├── exif.ts                    # EXIF抽出（exifr使用）
│   │   ├── clientThumbnail.ts         # ブラウザCanvasでのサムネイル生成
│   │   ├── auth.ts                    # パスワード照合・セッションCookie検証
│   │   └── types.ts                   # Photo/Tag等の型定義
│   └── styles/
│       └── retro-theme.ts             # 配色・フォントなどのデザイントークン
└── public/
    └── icons/                          # PWA用アイコン各サイズ
```

## 2. 各ファイルの役割・主要処理

### 基盤設定
- **wrangler.toml**: D1データベース・R2バケットのバインディング名を定義。ローカル開発では`wrangler pages dev`でエミュレート。
- **middleware.ts**: リクエストごとにセッションCookieを検証し、未ログインなら`/login`へリダイレクト。ログイン画面自体とAPIの一部（ログインAPI）は対象外にする。
- **migrations/0001_init.sql**: `photos`（id, file_key, thumbnail_key, caption, taken_at, latitude, longitude, created_at）、`tags`（id, name）、`photo_tags`（photo_id, tag_id）のテーブル定義。

### 認証
- **lib/auth.ts**: 環境変数`APP_PASSWORD`とのハッシュ比較、セッションCookieの発行・検証ロジック。
- **api/auth/login/route.ts**: パスワードを受け取り一致すればセッションCookieを発行。
- **api/auth/logout/route.ts**: Cookieを削除。
- **app/login/page.tsx**: パスワード入力フォーム。

### アップロード
- **lib/clientThumbnail.ts**: ブラウザのCanvas APIで画像を縮小しBlobを生成（サーバー側リサイズをしないための対応）。
- **lib/exif.ts**: `exifr`でオリジナル画像から撮影日時・GPS座標を抽出。取得できない場合はnull/アップロード日時で代替。
- **components/UploadForm.tsx**: 複数ファイル選択→各ファイルについてEXIF抽出とサムネイル生成→キャプション/タグ入力→アップロードAPI呼び出し。
- **api/upload/route.ts**: オリジナル画像とサムネイルをR2に保存（`lib/r2.ts`）、D1にレコード作成（`lib/db.ts`）。
- **lib/r2.ts**: R2へのオブジェクト保存・削除・公開URL構築。

### 一覧・詳細・編集
- **api/photos/route.ts**: 撮影日時降順で一覧取得（タグによる絞り込みクエリ対応）。
- **api/photos/[id]/route.ts**: 単体取得、キャプション/タグのPATCH更新、DELETE（D1レコード削除＋R2オブジェクト削除）。
- **components/PhotoGrid.tsx / PhotoCard.tsx**: ポラロイド風フレームでの一覧表示。
- **app/photos/[id]/page.tsx**: 拡大表示、キャプション編集フォーム、タグ編集、削除ボタン（確認ダイアログ付き）。

### タグ・地図
- **api/tags/route.ts**: 登録済みタグ一覧取得。
- **components/TagFilterBar.tsx / app/tags/page.tsx**: タグ選択による絞り込み一覧。
- **components/MapView.tsx / app/map/page.tsx**: Leaflet + OpenStreetMapで緯度経度のある写真をピン表示、ピンタップで詳細へ遷移。

### PWA・デザイン
- **app/manifest.ts, public/icons/**: ホーム画面追加用のマニフェストとアイコン。
- **src/styles/retro-theme.ts, globals.css**: セピア調配色・手書き風フォント・フィルム枠のデザイントークン。
- **components/BottomNav.tsx**: 一覧／アップロード／タグ／地図への遷移タブ（モバイル最優先）。

## 3. 実装順序

1. **プロジェクト基盤構築** — Next.js + TypeScript + Tailwindのセットアップ、Cloudflare Pages向け設定、Git初期化
2. **DB・ストレージ準備** — D1マイグレーション作成、R2バケット作成、ローカルエミュレーション確認
3. **認証機能** — パスワードログイン、セッションCookie、middlewareでのルート保護
4. **アップロード機能** — クライアント側サムネイル生成→EXIF抽出→R2保存→D1登録の一連の流れ
5. **一覧表示（トップ画面）** — 写真一覧取得・グリッド表示・レトロなカードデザインの土台
6. **詳細・編集・削除機能** — 詳細画面、キャプション/タグ編集API、削除API
7. **タグ機能** — タグ管理・絞り込み
8. **地図表示** — Leaflet地図・ピン表示・詳細への遷移
9. **PWA対応** — マニフェスト・アイコン・ホーム画面追加動作の確認
10. **レトロUIの仕上げ** — 配色・フォント・枠デザインの適用、レスポンシブの最終調整
11. **デプロイ・実機確認** — Cloudflare Pagesへデプロイし、スマホ実機で一通り操作確認

依存関係上、1→2→3は必須の順序。4〜8は基本的にこの順が自然だが、アップロード機能（4）ができないと5以降の表示確認がしづらいため、4は早めに完成させる。

## 4. 動作確認方法（各段階）

| 段階 | 確認方法 |
|---|---|
| 基盤構築 | `npm run dev`でローカル起動し、Tailwindが適用された空ページが表示されることを確認 |
| DB・R2準備 | `wrangler d1 execute`でテーブル作成を確認、`wrangler r2 object list`でバケット疎通確認 |
| 認証 | ブラウザで`/`にアクセスし`/login`へリダイレクトされること、正しいパスワードでログインできること、誤ったパスワードで拒否されることを確認 |
| アップロード | 実際にスマホ（同一Wi-Fi経由のローカル環境、または本番デプロイ後）から複数枚アップロードし、R2にオリジナル/サムネイルが保存され、D1にレコードが作成されることを確認。EXIFのある写真とない写真の両方でテスト |
| 一覧表示 | アップロードした写真が新しい順にグリッド表示されること、スマホ・PC双方の画面幅で崩れないことを確認 |
| 詳細・編集・削除 | キャプション編集が保存されること、削除後に一覧・R2・D1から消えていることを確認 |
| タグ | タグ付きアップロード後、タグ絞り込みで正しい写真だけ表示されることを確認 |
| 地図 | GPS付き写真がピン表示され、ピンタップで詳細に遷移することを確認。GPSなし写真が地図に出ないことも確認 |
| PWA | スマホのブラウザから「ホーム画面に追加」し、アイコンから起動してブラウザUIなしで動作することを確認 |
| デプロイ後 | Cloudflare Pagesの本番URLに外出先（自宅Wi-Fi以外の回線）からアクセスできることを確認 |

## 5. 未確定・実装時に判断する点
- iPhoneのHEIC画像をアップロード時にJPEG変換するか（ブラウザのCanvas経由であれば自然にJPEG/PNG化される見込みだが、実機で要検証）
- レトロデザインの詳細な配色・フォント選定（実装しながら調整）
- タグの重複統合（表記ゆれ）の扱い

# Kioku

旅先の写真をレトロな雰囲気で残す、個人用の写真アルバムアプリ。

詳細な要件は [`requirements.md`](./requirements.md)、実装方針は
[`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) を参照。

## 技術スタック

- Next.js（App Router / TypeScript）
- Cloudflare Workers（`@opennextjs/cloudflare`でNext.jsをデプロイ）
- Cloudflare D1（写真・タグのメタデータ）
- Cloudflare R2（写真本体・サムネイルの保存）
- Leaflet + OpenStreetMap（地図表示）
- Tailwind CSS（レトロなポラロイド風UI）

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ローカル用の環境変数を設定

`.dev.vars.example` を `.dev.vars` にコピーし、パスワードとセッション用の秘密文字列を設定する
（`.dev.vars` は Git 管理外）。

```bash
cp .dev.vars.example .dev.vars
```

### 3. ローカルDBにスキーマを適用

```bash
npm run db:migrate:local
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

`http://localhost:3000` を開く。D1・R2はwranglerによるローカルエミュレーション
（`.wrangler/state`配下に永続化）で動作するため、Cloudflareアカウントなしで一通り動作確認できる。

## Cloudflareへのデプロイ

初回のみ、実際のD1データベースとR2バケットを作成する。

```bash
npx wrangler login
npx wrangler d1 create kioku-db
npx wrangler r2 bucket create kioku-photos
```

`wrangler d1 create` の出力に含まれる `database_id` を [`wrangler.jsonc`](./wrangler.jsonc) の
`REPLACE_WITH_D1_DATABASE_ID` に反映する。

本番用のシークレットを登録する。

```bash
npx wrangler secret put APP_PASSWORD
npx wrangler secret put SESSION_SECRET
```

本番DBにもスキーマを適用する。

```bash
npm run db:migrate:remote
```

ビルドしてデプロイする。

```bash
npm run cf:deploy
```

デプロイ後に発行されるURLへスマホ・PCからアクセスできる（HTTPS対応、外出先からも利用可能）。

## PWA

スマホのブラウザでアクセス後、「ホーム画面に追加」するとアプリのように起動できる
（`src/app/manifest.ts`、`public/icons/`）。

## アイコンの再生成

`scripts/icon-source.svg` / `scripts/icon-source-maskable.svg` を編集後、以下で再生成できる
（`sharp`はこの用途のみのdevDependency）。

```bash
node scripts/gen-icons.mjs
```

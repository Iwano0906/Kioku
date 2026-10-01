import { UploadForm } from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div>
      <h2 className="font-heading text-lg text-[var(--color-ink)]">写真を追加</h2>
      <div className="mt-3">
        <UploadForm />
      </div>
    </div>
  );
}

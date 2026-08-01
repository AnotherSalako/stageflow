"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Link2 } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

type Item = { id: string; imageUrl: string; caption: string | null; type: "IMAGE" | "VIDEO" | "LINK" };

export default function PortfolioManager({ images }: { images: Item[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<"VIDEO" | "LINK">("VIDEO");
  const [savingLink, setSavingLink] = useState(false);
  const [error, setError] = useState("");

  const atLimit = images.length >= 12;

  async function addItem(imageUrl: string, type: string) {
    const res = await fetch("/api/vendor/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, type }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    router.refresh();
  }

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", compressed);
    const res = await fetch("/api/vendor/upload", { method: "POST", body: formData });
    if (!res.ok) {
      setUploading(false);
      const data = await res.json();
      setError(data.error || "Upload failed");
      return;
    }
    const { url } = await res.json();
    await addItem(url, "IMAGE");
    setUploading(false);
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavingLink(true);
    await addItem(linkUrl, linkType);
    setSavingLink(false);
    setLinkUrl("");
    setLinkOpen(false);
  }

  async function handleRemove(id: string) {
    await fetch(`/api/vendor/portfolio/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-stone-400">Photos, video links (YouTube/TikTok), or any link to your work. Up to 12 items.</p>

      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-white/10">
            {img.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.imageUrl} alt={img.caption || "Portfolio"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface2 p-2 text-center">
                {img.type === "VIDEO" ? <Play size={20} className="text-white" /> : <Link2 size={20} className="text-white" />}
                <p className="line-clamp-2 text-[10px] text-stone-400">{img.imageUrl.replace(/^https?:\/\//, "")}</p>
              </div>
            )}
            <button onClick={() => handleRemove(img.id)} className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white">
              ✕
            </button>
          </div>
        ))}
      </div>

      {!atLimit && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary flex-1 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "+ Add photo"}
          </button>
          <button type="button" onClick={() => setLinkOpen((v) => !v)} className="btn-secondary flex-1">
            + Add video/link
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {linkOpen && (
        <form onSubmit={handleAddLink} className="card flex flex-col gap-2">
          <div className="flex gap-2">
            <select value={linkType} onChange={(e) => setLinkType(e.target.value as "VIDEO" | "LINK")} className="input w-32 shrink-0">
              <option value="VIDEO">Video</option>
              <option value="LINK">Link</option>
            </select>
            <input
              required
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="input flex-1"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={savingLink} className="btn-primary flex-1 disabled:opacity-60">
              {savingLink ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setLinkOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-alert">{error}</p>}
    </div>
  );
}

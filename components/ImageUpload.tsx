"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

const MAX_RAW_BYTES = 15 * 1024 * 1024; // sanity cap on the original file, before compression

export default function ImageUpload({
  value,
  onChange,
  shape = "rect",
  emptyLabel = "Add photo",
}: {
  value: string | null;
  onChange: (url: string) => void;
  shape?: "circle" | "rect";
  emptyLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading">("idle");
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    if (file.size > MAX_RAW_BYTES) {
      setError("Image must be smaller than 15MB.");
      return;
    }
    setStatus("compressing");
    const compressed = await compressImage(file);

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", compressed);
    const res = await fetch("/api/vendor/upload", { method: "POST", body: formData });
    setStatus("idle");
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Upload failed");
      return;
    }
    const { url } = await res.json();
    onChange(url);
  }

  const shapeClass = shape === "circle" ? "rounded-full aspect-square" : "rounded-2xl aspect-video";
  const loading = status !== "idle";

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`relative flex w-full items-center justify-center overflow-hidden border border-dashed border-white/15 bg-surface ${shapeClass} ${
          shape === "circle" ? "mx-auto max-w-[128px]" : ""
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-stone-500">
            <Camera size={22} strokeWidth={1.5} />
            <span className="text-xs">{emptyLabel}</span>
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
            {status === "compressing" ? "Preparing..." : "Uploading..."}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-alert">{error}</p>}
    </div>
  );
}

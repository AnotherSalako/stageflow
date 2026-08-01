"use client";

import { useState } from "react";
import { Play, Link2, X } from "lucide-react";

type Item = { id: string; imageUrl: string; caption: string | null; type: "IMAGE" | "VIDEO" | "LINK" };

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function PortfolioGallery({ items, businessName }: { items: Item[]; businessName: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openItem = items.find((i) => i.id === openId) || null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const youtubeId = item.type === "VIDEO" ? getYouTubeId(item.imageUrl) : null;
          const viewableInApp = item.type === "IMAGE" || youtubeId;

          if (!viewableInApp) {
            return (
              <a
                key={item.id}
                href={item.imageUrl}
                target="_blank"
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl bg-surface p-2 text-center"
              >
                <Link2 size={20} className="text-white" />
                <p className="line-clamp-2 text-[10px] text-stone-400">{item.imageUrl.replace(/^https?:\/\//, "")}</p>
              </a>
            );
          }

          return (
            <button key={item.id} onClick={() => setOpenId(item.id)} className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : item.imageUrl}
                alt={item.caption || businessName}
                className="h-full w-full object-cover transition-transform group-active:scale-105"
              />
              {youtubeId && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink">
                    <Play size={16} className="ml-0.5" fill="currentColor" />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {openItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpenId(null)}>
          <button
            onClick={() => setOpenId(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={20} />
          </button>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {openItem.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={openItem.imageUrl} alt={openItem.caption || businessName} className="w-full rounded-2xl object-contain" />
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(openItem.imageUrl)}?autoplay=1`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

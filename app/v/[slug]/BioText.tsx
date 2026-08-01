"use client";

import { useState } from "react";

export default function BioText({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio.length > 140;

  return (
    <div className="mt-2">
      <p className={`text-sm leading-relaxed text-stone-300 ${expanded ? "" : "line-clamp-3"}`}>{bio}</p>
      {isLong && (
        <button onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs font-semibold text-cappuccino">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

type QrType = "PROFILE" | "LANDING" | "WHATSAPP" | "CUSTOM";
type StyleKey = "minimal" | "branded" | "highcontrast";
type Size = "small" | "medium" | "large";

const STYLE_PRESETS: Record<StyleKey, { label: string; fg: string; bg: string }> = {
  minimal: { label: "Minimal", fg: "#000000", bg: "#FFFFFF" },
  branded: { label: "Branded", fg: "#12172B", bg: "#F3E6D5" },
  highcontrast: { label: "High-contrast (print on dark)", fg: "#FFFFFF", bg: "#000000" },
};

const SIZE_PX: Record<Size, number> = { small: 512, medium: 1024, large: 1600 };

export default function QrGenerator({ profileUrl, whatsapp }: { profileUrl: string; whatsapp: string | null }) {
  const [type, setType] = useState<QrType>("PROFILE");
  const [customValue, setCustomValue] = useState("");
  const [styleKey, setStyleKey] = useState<StyleKey>("branded");
  const [size, setSize] = useState<Size>("medium");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const landingUrl = typeof window !== "undefined" ? window.location.origin : "";
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : "";

  const targetValue = type === "PROFILE" ? profileUrl : type === "LANDING" ? landingUrl : type === "WHATSAPP" ? waLink : customValue;

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, customValue, styleKey, size, logoUrl]);

  async function render() {
    const canvas = canvasRef.current;
    if (!canvas || !targetValue) return;
    setError("");

    const preset = STYLE_PRESETS[styleKey];
    const px = SIZE_PX[size];

    try {
      await QRCode.toCanvas(canvas, targetValue, {
        width: px,
        margin: 3, // quiet zone — required for reliable scanning, don't let anyone set this to 0
        errorCorrectionLevel: logoUrl ? "H" : "M",
        color: { dark: preset.fg, light: preset.bg },
      });

      if (logoUrl) {
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!ctx) return;
          const logoSize = px * 0.2;
          const x = (px - logoSize) / 2;
          const y = (px - logoSize) / 2;
          const pad = logoSize * 0.15;
          ctx.fillStyle = preset.bg;
          ctx.beginPath();
          ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 12);
          ctx.fill();
          ctx.drawImage(img, x, y, logoSize, logoSize);
        };
        img.src = logoUrl;
      }
    } catch {
      setError("Couldn't generate a QR code for that value.");
    }
  }

  async function handleLogoFile(file: File) {
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/vendor/upload", { method: "POST", body: formData });
    setUploadingLogo(false);
    if (!res.ok) {
      setError("Logo upload failed");
      return;
    }
    const { url } = await res.json();
    setLogoUrl(url);
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "stageflow-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function downloadSvg() {
    if (!targetValue) return;
    const preset = STYLE_PRESETS[styleKey];
    const svg = await QRCode.toString(targetValue, {
      type: "svg",
      margin: 3,
      errorCorrectionLevel: logoUrl ? "H" : "M",
      color: { dark: preset.fg, light: preset.bg },
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "stageflow-qr.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center">
        <div className="rounded-2xl bg-white p-3">
          <canvas ref={canvasRef} className="h-48 w-48" />
        </div>
      </div>
      {error && <p className="text-center text-sm text-alert">{error}</p>}

      <div className="card flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">Links to</label>
          <select value={type} onChange={(e) => setType(e.target.value as QrType)} className="input">
            <option value="PROFILE">My StageFlow profile</option>
            <option value="LANDING">StageFlow app / landing page</option>
            {whatsapp && <option value="WHATSAPP">My WhatsApp</option>}
            <option value="CUSTOM">Custom link or number</option>
          </select>
        </div>
        {type === "CUSTOM" && (
          <input
            placeholder="https://... or a WhatsApp link"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="input"
          />
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <p className="eyebrow">Style</p>
        <div className="flex gap-2">
          {(Object.keys(STYLE_PRESETS) as StyleKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setStyleKey(key)}
              className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium ${
                styleKey === key ? "border-cappuccino bg-cappuccino/10 text-cappuccino" : "border-white/10 text-stone-400"
              }`}
            >
              {STYLE_PRESETS[key].label}
            </button>
          ))}
        </div>

        <p className="eyebrow mt-2">Size (for print)</p>
        <div className="flex gap-2">
          {(["small", "medium", "large"] as Size[]).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium capitalize ${
                size === s ? "border-cappuccino bg-cappuccino/10 text-cappuccino" : "border-white/10 text-stone-400"
              }`}
            >
              {s} ({SIZE_PX[s]}px)
            </button>
          ))}
        </div>

        <p className="eyebrow mt-2">Logo (optional)</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="btn-secondary flex-1 disabled:opacity-60">
            {uploadingLogo ? "Uploading..." : logoUrl ? "Change logo" : "Add logo"}
          </button>
          {logoUrl && (
            <button type="button" onClick={() => setLogoUrl(null)} className="btn-secondary">
              Remove
            </button>
          )}
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={downloadPng} className="btn-primary flex flex-1 items-center justify-center gap-2">
          <Download size={16} /> PNG
        </button>
        <button onClick={downloadSvg} className="btn-secondary flex-1">
          SVG
        </button>
      </div>

      <div className="card">
        <p className="eyebrow">Before you print in bulk</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-stone-300">
          <li>• Scan it yourself with 2-3 different phones first — cheap Android cameras are pickier than iPhones.</li>
          <li>• Keep the white quiet zone around the code intact — don't crop tight or overlay text on top of it.</li>
          <li>• "High-contrast" (light-on-dark) codes scan less reliably than dark-on-light — test extra carefully before a large print run.</li>
          <li>• At small print sizes (business cards), use "Minimal" or "Branded" without a logo — logos need more scan margin for error correction.</li>
        </ul>
      </div>
    </div>
  );
}

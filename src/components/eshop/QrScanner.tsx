"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";

interface Props {
  onScan: (productId: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let animationId: number;

    async function startCamera() {
      // Check BarcodeDetector support
      if (!("BarcodeDetector" in window)) {
        setError(
          "Váš prohlížeč nepodporuje skenování QR. Použijte Chrome na Android/macOS."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 } },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // @ts-expect-error BarcodeDetector is not in TS lib yet
        const detector = new BarcodeDetector({ formats: ["qr_code"] });

        async function detect() {
          if (!scanningRef.current || !videoRef.current) return;

          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const value = barcodes[0].rawValue as string;
              // Extract product ID from URL: .../eshop/s/{product-id}
              const match = value.match(/\/eshop\/s\/([a-f0-9-]+)/i);
              if (match) {
                scanningRef.current = false;
                onScan(match[1]);
                return;
              }
            }
          } catch {
            // detection frame error, continue
          }

          animationId = requestAnimationFrame(detect);
        }

        detect();
      } catch (err) {
        if (err instanceof Error && err.name === "NotAllowedError") {
          setError("Přístup ke kameře byl zamítnut. Povolte kameru v nastavení prohlížeče.");
        } else {
          setError("Nepodařilo se spustit kameru.");
        }
      }
    }

    startCamera();

    return () => {
      scanningRef.current = false;
      cancelAnimationFrame(animationId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onScan]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/80 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-4 w-4" />
          <span className="text-sm font-medium">Naskenujte QR kód produktu</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/70 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Camera view */}
      <div className="relative flex flex-1 items-center justify-center">
        {error ? (
          <div className="px-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-sm text-white">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            {/* Scan guide overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-52 w-52 rounded-2xl border-2 border-white/60" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

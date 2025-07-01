"use client";

import { useState, useCallback } from "react";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Color from "colorjs.io";
import { toast } from "sonner";
import { Palette } from "@phosphor-icons/react";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";

function kmeans(data, k, maxIter = 20) {
  const centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * data.length);
    if (!used.has(idx)) {
      centroids.push([...data[idx]]);
      used.add(idx);
    }
  }
  let assignments = new Array(data.length).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    assignments = data.map((point) => {
      let minDist = Infinity;
      let minIdx = 0;
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          centroid.reduce((sum, c, j) => sum + (c - point[j]) ** 2, 0),
        );
        if (dist < minDist) {
          minDist = dist;
          minIdx = i;
        }
      });
      return minIdx;
    });
    const newCentroids = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = Array(k).fill(0);
    data.forEach((point, i) => {
      const cluster = assignments[i];
      for (let j = 0; j < 3; j++) {
        newCentroids[cluster][j] += point[j];
      }
      counts[cluster]++;
    });
    for (let i = 0; i < k; i++) {
      if (counts[i] === 0) continue;
      for (let j = 0; j < 3; j++) {
        newCentroids[i][j] /= counts[i];
      }
    }
    if (
      centroids.every((c, i) =>
        c.every((v, j) => Math.abs(v - newCentroids[i][j]) < 1e-2),
      )
    ) {
      break;
    }
    for (let i = 0; i < k; i++) {
      centroids[i] = newCentroids[i];
    }
  }
  return { centroids, assignments };
}

const CACHE = {};

export default function ColorPaletteInterface() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);

  function getImageHash(dataUrl) {
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
      hash |= 0;
    }
    return hash + "-" + numColors;
  }

  const extractPalette = useCallback(async () => {
    if (!preview) return;
    setLoading(true);
    setPalette([]);
    try {
      const hash = getImageHash(preview);
      if (CACHE[hash]) {
        setPalette(CACHE[hash]);
        setLoading(false);
        return;
      }
      const img = new window.Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = preview;
      });
      const size = 200;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      }
      const labPixels = pixels.map(
        ([r, g, b]) =>
          new Color("srgb", [r / 255, g / 255, b / 255]).to("lab").coords,
      );
      const { centroids, assignments } = kmeans(labPixels, numColors);
      const clusterCounts = Array(numColors).fill(0);
      assignments.forEach((clusterIdx) => {
        clusterCounts[clusterIdx]++;
      });
      const palette = centroids.map((lab, i) => {
        const color = new Color("lab", lab).to("srgb");
        const rgb = color.coords.map((v) => Math.max(0, Math.min(1, v)));
        const hex = new Color("srgb", rgb).toString({ format: "hex" });
        const percent = (clusterCounts[i] / pixels.length) * 100;
        return { hex, percent: percent.toFixed(1) };
      });
      CACHE[hash] = palette;
      setPalette(palette);
      toast.success("Palette extracted!");
    } catch (err) {
      toast.error("Failed to extract palette");
    } finally {
      setLoading(false);
    }
  }, [preview, numColors]);

  const handleClearResult = () => {
    setPalette([]);
  };

  const handleCopyAll = () => {
    if (palette.length === 0) return;
    const allHex = palette.map((swatch) => swatch.hex).join(", ");
    navigator.clipboard.writeText(allHex);
    toast.success("All hex codes copied!");
  };

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copied!`);
  };

  const previewArea = preview ? (
    <div className="flex-1 relative rounded-md overflow-hidden min-h-[280px] flex items-center justify-center">
      <Image
        src={preview}
        alt="Preview"
        width={800}
        height={600}
        className="max-w-full max-h-full object-contain"
        unoptimized
      />
    </div>
  ) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            file={file}
            setFile={setFile}
            preview={preview}
            dragActive={dragActive}
            setDragActive={setDragActive}
            setPreview={setPreview}
            loading={loading}
            onSubmit={extractPalette}
            onClearResult={handleClearResult}
            title="Extract Palette"
            description="Upload an image to extract its color palette"
            buttonText="Extract Palette"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={previewArea}
          >
            {preview && (
              <div className="border-2 border-neutral-700 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-neutral-300">
                      Number of Colors
                    </label>
                    <div className="text-xs text-neutral-400">
                      {numColors} colors
                    </div>
                  </div>

                  <div className="relative">
                    <Slider
                      value={[numColors]}
                      onValueChange={(values) => setNumColors(values[0])}
                      min={2}
                      max={10}
                      step={1}
                      className="
    w-full
    [&_[data-slot=slider-track]]:bg-neutral-700
    [&_[data-slot=slider-range]]:bg-neutral-200
  "
                    />

                    {/* Color count markers */}
                    <div className="relative mt-2 h-5 overflow-hidden">
                      {[2, 4, 6, 8, 10].map((count, index) => {
                        const position = ((count - 2) / (10 - 2)) * 100;
                        return (
                          <div
                            key={count}
                            className="absolute transform -translate-x-1/2"
                            style={{ left: `${position}%` }}
                          >
                            <div className="w-0.5 h-1.5 bg-neutral-500 mx-auto"></div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
          <ResultCard
            resultUrl={palette.length > 0 ? "palette-extracted" : null}
            resultFormat="palette"
            onDownload={handleCopyAll}
            title="Extracted Palette"
            description={
              palette.length > 0
                ? `${palette.length} colors extracted from your image`
                : "Color palette will appear here"
            }
            successLabel="Extracted"
            noResultMessage="No palette yet"
            noResultSubMessage="Upload and extract a palette to see it here"
            downloadButtonText="Copy All Hex Codes"
            toastMessage="Palette extracted successfully!"
            showToast={false}
            customIcon={<Palette className="h-5 w-5" />}
            customContent={
              palette.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-16 justify-items-center max-w-md mx-auto">
                  {palette.map((swatch, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => handleCopyHex(swatch.hex)}
                        >
                          <div
                            style={{
                              width: 85,
                              height: 85,
                              background: swatch.hex,
                              border: "1px solid #525252",
                              transition: "box-shadow 0.2s",
                            }}
                            className="group-hover:shadow-lg rounded-lg"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{swatch.hex}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center space-x-3 mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#352F44" }}>
            Color Palette Extractor
          </h1>
          <p className="text-sm" style={{ color: "#5C5470" }}>
            Extract dominant colors from your image using k-means clustering in
            Lab color space.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-full">
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
          >
            {/* Number of colors slider */}
            {preview && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "#352F44" }}
                  >
                    Number of Colors: {numColors}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={numColors}
                    onChange={(e) => setNumColors(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: "#5C5470" }}
                  />
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: "#5C5470" }}
                  >
                    <span>Fewer</span>
                    <span>More</span>
                  </div>
                </div>
              </div>
            )}
          </UploadCard>
        </div>

        {/* Palette result */}
        <div className="h-full">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center max-w-md mx-auto">
                  {palette.map((swatch, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => handleCopyHex(swatch.hex)}
                        >
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              background: swatch.hex,
                              borderRadius: 8,
                              border: "1px solid #ccc",
                              transition: "box-shadow 0.2s",
                            }}
                            className="group-hover:shadow-lg"
                          />
                          <span
                            className="text-xs mt-2"
                            style={{ color: "#5C5470" }}
                          >
                            {swatch.percent}%
                          </span>
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

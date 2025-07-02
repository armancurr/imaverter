import { useState, useCallback } from "react";
import Color from "colorjs.io";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";

const CACHE = {};

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

export default function useColorPalette() {
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);
  const [currentFile, setCurrentFile] = useState(null);
  const { addRecentImage } = useRecentImages();

  const getImageHash = useCallback((dataUrl, colorCount) => {
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
      hash |= 0;
    }
    return hash + "-" + colorCount;
  }, []);

  const createPaletteImage = useCallback((paletteColors) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 100;

    const colorWidth = canvas.width / paletteColors.length;

    paletteColors.forEach((color, index) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(index * colorWidth, 0, colorWidth, canvas.height);
    });

    return canvas.toDataURL("image/png");
  }, []);

  const extractPalette = useCallback(
    async (preview, file) => {
      if (!preview) return;

      if (file) {
        setCurrentFile(file);
      }

      setLoading(true);
      setPalette([]);

      try {
        const hash = getImageHash(preview, numColors);
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

        const paletteImageUrl = createPaletteImage(palette);
        const fileName = (file || currentFile)?.name || "image";

        addRecentImage({
          type: "color-palette",
          originalName: fileName,
          resultUrl: paletteImageUrl,
          format: "png",
          action: `${numColors} color palette`,
          downloadName: `${fileName.split(".")[0]}-palette-${numColors}-colors.png`,
        });

        toast.success("Palette extracted!", {
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      } catch (err) {
        console.error("Error extracting palette:", err);
        toast.error("Failed to extract palette");
      } finally {
        setLoading(false);
      }
    },
    [numColors, getImageHash, createPaletteImage, addRecentImage, currentFile],
  );

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

  const clearPalette = () => {
    setPalette([]);
  };

  return {
    loading,
    palette,
    numColors,
    setNumColors,
    extractPalette,
    handleCopyAll,
    handleCopyHex,
    clearPalette,
  };
}

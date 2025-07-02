import { useState, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "imaverter_recent_images";
const MAX_RECENT_ITEMS = 4;
const THUMBNAIL_SIZE = 150;
const THUMBNAIL_QUALITY = 0.7;

export default function useRecentImages() {
  const [recentImages, setRecentImages] = useState([]);

  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(
          (item) => Date.now() - item.timestamp < 23 * 60 * 60 * 1000,
        );
        setRecentImages(filtered);

        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch (error) {
      console.error("Error loading recent images:", error);
      if (error.name === "QuotaExceededError") {
        localStorage.removeItem(STORAGE_KEY);
        setRecentImages([]);
        toast.error("Storage full! Cleared recent images.");
      }
    }
  };

  const createCompressedThumbnail = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const aspectRatio = img.width / img.height;
        let width = THUMBNAIL_SIZE;
        let height = THUMBNAIL_SIZE;

        if (aspectRatio > 1) {
          height = THUMBNAIL_SIZE / aspectRatio;
        } else {
          width = THUMBNAIL_SIZE * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(
          "image/jpeg",
          THUMBNAIL_QUALITY,
        );
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  const isDataUrl = (url) => {
    return url && url.startsWith("data:");
  };

  const addRecentImage = async (imageData) => {
    try {
      const thumbnailUrl = await createCompressedThumbnail(imageData.resultUrl);

      const newItem = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...imageData,
        thumbnailUrl,
        downloadUrl: isDataUrl(imageData.resultUrl)
          ? imageData.resultUrl
          : imageData.resultUrl,
        isLocal: isDataUrl(imageData.resultUrl),
      };

      if (!isDataUrl(imageData.resultUrl)) {
        newItem.resultUrl = imageData.resultUrl;
      }

      const updated = [newItem, ...recentImages].slice(0, MAX_RECENT_ITEMS);

      try {
        setRecentImages(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (storageError) {
        if (storageError.name === "QuotaExceededError") {
          const reducedItems = [];
          for (let i = 0; i < Math.min(4, updated.length); i++) {
            const item = updated[i];
            const verySmallThumbnail = await createVerySmallThumbnail(
              item.thumbnailUrl,
            );
            reducedItems.push({
              ...item,
              thumbnailUrl: verySmallThumbnail,
            });
          }

          setRecentImages(reducedItems);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedItems));
          toast.warning(
            "Storage limit reached. Kept only 4 most recent images with smaller previews.",
          );
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error("Error saving recent image:", error);
      toast.error("Failed to save to recent images");
    }
  };

  const createVerySmallThumbnail = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const aspectRatio = img.width / img.height;
        let width = 64;
        let height = 64;

        if (aspectRatio > 1) {
          height = 64 / aspectRatio;
        } else {
          width = 64 * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.5);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  const downloadRecentImage = async (item) => {
    try {
      let downloadUrl = item.downloadUrl || item.resultUrl;

      if (item.isLocal || isDataUrl(downloadUrl)) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download =
          item.downloadName ||
          `${item.originalName.split(".")[0]}.${item.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          item.downloadName ||
          `${item.originalName.split(".")[0]}.${item.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success(`Downloaded ${item.originalName}!`);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image - original may have expired");
    }
  };

  const clearRecentImages = () => {
    setRecentImages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Recent images cleared!");
  };

  const getStorageInfo = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const sizeInBytes = stored ? new Blob([stored]).size : 0;
      const sizeInKB = (sizeInBytes / 1024).toFixed(1);
      return { sizeInKB, itemCount: recentImages.length };
    } catch (error) {
      return { sizeInKB: "0", itemCount: 0 };
    }
  };

  return {
    recentImages,
    addRecentImage,
    downloadRecentImage,
    clearRecentImages,
    loadRecentImages,
    getStorageInfo,
  };
}

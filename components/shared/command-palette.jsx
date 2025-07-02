"use client";

import { useEffect } from "react";
import {
  Command as CommandIcon,
  DownloadSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import useRecentImages from "@/hooks/use-recent-images";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

export default function CommandPalette({ open, setOpen }) {
  const {
    recentImages,
    downloadRecentImage,
    clearRecentImages,
    getStorageInfo,
  } = useRecentImages();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const handleImageClick = (item) => {
    downloadRecentImage(item);
  };

  const handleClearAll = () => {
    clearRecentImages();
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const storageInfo = getStorageInfo();
  const maxStorageKB = 1024; // 1MB limit
  const storagePercentage = Math.min(
    (parseFloat(storageInfo.sizeInKB) / maxStorageKB) * 100,
    100,
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-in fade-in-0 duration-100">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in-0 duration-100"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-2xl mx-4 rounded-xl border shadow-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 animate-in fade-in-0 duration-100">
        <div className="p-4">
          {recentImages.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-200">
                  Recent Images
                </h3>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
                >
                  <TrashSimple className="h-3 w-3" />
                  Clear All
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 text-xs text-neutral-500">
                  <span>Storage Used</span>
                  <span>
                    {storageInfo.sizeInKB}KB / {maxStorageKB}KB
                  </span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {recentImages.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleImageClick(item)}
                    className="group cursor-pointer p-2 rounded-xl hover:bg-neutral-900 transition-colors"
                  >
                    <div className="relative aspect-square bg-neutral-800 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={item.thumbnailUrl || item.resultUrl}
                        alt={item.originalName}
                        fill
                        className="object-cover transition-transform duration-200 border-2 border-neutral-800 rounded-lg"
                        sizes="150px"
                      />
                      <div className="absolute inset-0 group-hover:bg-black/20 group-hover:backdrop-blur-xs transition-all duration-200 flex items-center justify-center">
                        <DownloadSimple className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-neutral-200 truncate mb-1">
                        {item.originalName}
                      </p>
                      <p className="text-xs text-neutral-500">{item.action}</p>
                      <p className="text-xs text-neutral-600">
                        {formatTimeAgo(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CommandIcon className="mx-auto h-8 w-8 text-neutral-600 mb-3" />
              <p className="text-sm text-neutral-400 mb-1">No recent images</p>
              <p className="text-xs text-neutral-500">
                Process some images to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

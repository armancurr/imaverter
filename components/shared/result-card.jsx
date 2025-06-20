"use client";

import React, { useEffect } from "react";
import {
  DownloadSimple,
  ImageSquare,
  ArrowLineDown,
  CheckCircle,
  Info,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";

export default function ResultCard({
  // Result data
  resultUrl,
  resultFormat,

  // File size information
  originalSize,
  compressedSize,
  compressionRatio,

  // Actions
  onDownload,

  // UI customization
  title = "Processed Image",
  description,
  downloadButtonText,
  successLabel = "Processed",

  // Status messages
  noResultMessage = "No processed image yet",
  noResultSubMessage = "Upload and process an image to see it here",

  // Toast notification
  showToast = true,
  toastMessage = "Image processed. Download it now.",
}) {
  // Auto-generate description if not provided
  const finalDescription =
    description ||
    (resultUrl
      ? "Your processed image is ready for download"
      : "Processed image will appear here");

  // Auto-generate download button text if not provided
  const finalDownloadButtonText =
    downloadButtonText ||
    (resultFormat
      ? `Download ${resultFormat.toUpperCase()}`
      : "Download Image");

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (resultUrl && showToast) {
      toast.success(toastMessage, {
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    }
  }, [resultUrl, showToast, toastMessage]);

  return (
    <Card className="flex flex-col border-none bg-neutral-900/90 lg:h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-neutral-200">
          <DownloadSimple className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          {finalDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-auto">
          <div
            className={`rounded-md border-2 p-6 sm:p-8 text-center transition-all duration-200 h-[280px] flex items-center justify-center ${
              resultUrl ? "border-[#e6fda3]/5 bg-[#e6fda3]/5" : "border-none"
            }`}
          >
            {resultUrl ? (
              <div className="space-y-3">
                <Image
                  src={resultUrl}
                  alt="Processed result"
                  className="mx-auto rounded-md object-contain max-h-[240px] max-w-full"
                  width={400}
                  height={400}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <ImageSquare className="mx-auto h-10 w-10 text-neutral-500" />
                <div>
                  <p className="font-medium text-neutral-300">
                    {noResultMessage}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {noResultSubMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {resultUrl && resultFormat && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <CheckCircle weight="bold" className="h-4 w-4 text-[#e6fda3]" />
                <Label className="text-sm font-medium text-neutral-200">
                  {successLabel}
                </Label>
              </div>
              <p className="text-xs text-neutral-500">
                Image processed in {resultFormat.toUpperCase()} format
              </p>
            </div>
          )}

          {/* File size information - show when we have compressed size data */}
          {resultUrl && compressedSize > 0 && (
            <div className="bg-neutral-800/50 rounded-md p-3">
              <div className="flex items-center space-x-1 mb-2">
                <Info weight="bold" className="h-4 w-4 text-[#e6fda3]" />
                <Label className="text-sm font-medium text-neutral-200">
                  File Information
                </Label>
              </div>
              <div className="text-xs text-neutral-400 space-y-1">
                {originalSize > 0 && (
                  <div>Original size: {formatFileSize(originalSize)}</div>
                )}
                <div>Compressed size: {formatFileSize(compressedSize)}</div>
                {compressionRatio > 0 && (
                  <div className="text-[#e6fda3]">
                    Size reduction: {compressionRatio.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={onDownload}
            disabled={!resultUrl}
            className="w-full py-6 mt-2 bg-neutral-700 hover:bg-neutral-700/70 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {finalDownloadButtonText}
            <ArrowLineDown weight="bold" className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

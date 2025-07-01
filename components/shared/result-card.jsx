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
  resultUrl,
  resultFormat,
  originalSize,
  compressedSize,
  compressionRatio,
  onDownload,
  title = "Processed Image",
  description,
  downloadButtonText,
  successLabel = "Processed",
  noResultMessage = "No processed image yet",
  noResultSubMessage = "Upload and process an image to see it here",
  showToast = true,
  toastMessage = "Image processed. Download it now.",
  customContent = null,
  customIcon = null,
}) {
  const finalDescription =
    description ||
    (resultUrl
      ? "Your processed image is ready for download"
      : "Processed image will appear here");

  const finalDownloadButtonText =
    downloadButtonText ||
    (resultFormat
      ? `Download ${resultFormat.toUpperCase()}`
      : "Download Image");

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
    <Card
      className="flex flex-col border shadow-lg h-full"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#B9B4C7",
      }}
    >
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle
          className="flex items-center space-x-2"
          style={{ color: "#352F44" }}
        >
          {customIcon || <DownloadSimple className="h-5 w-5" />}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-sm" style={{ color: "#5C5470" }}>
          {finalDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-6">
        {/* Main content area - takes up available space */}
        <div className="flex-1 flex flex-col">
          <div
            className={`flex-1 min-h-[320px] rounded-lg border-2 p-6 text-center transition-all duration-200 flex items-center justify-center ${
              resultUrl ? "shadow-md" : ""
            }`}
            style={{
              borderColor: resultUrl ? "#5C5470" : "#B9B4C7",
              backgroundColor: resultUrl ? "#FAF0E6" : "#FFFFFF",
            }}
          >
            {resultUrl ? (
              customContent ? (
                <div className="space-y-3 w-full">{customContent}</div>
              ) : (
                <div className="space-y-3 w-full">
                  <Image
                    src={resultUrl}
                    alt="Processed result"
                    className="mx-auto rounded-md object-contain max-h-[280px] max-w-full"
                    width={400}
                    height={400}
                  />
                </div>
              )
            ) : (
              <div className="space-y-3">
                <ImageSquare
                  className="mx-auto h-12 w-12"
                  style={{ color: "#5C5470" }}
                />
                <div>
                  <p
                    className="font-medium text-lg"
                    style={{ color: "#352F44" }}
                  >
                    {noResultMessage}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#5C5470" }}>
                    {noResultSubMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status and download section - fixed at bottom */}
        <div className="space-y-4 mt-6 flex-shrink-0">
          {resultUrl && resultFormat && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <CheckCircle
                  weight="bold"
                  className="h-4 w-4"
                  style={{ color: "#5C5470" }}
                />
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#352F44" }}
                >
                  {successLabel}
                </Label>
              </div>
              <p className="text-xs" style={{ color: "#5C5470" }}>
                Image processed in {resultFormat.toUpperCase()} format
              </p>
            </div>
          )}

          {/* File size information - show when we have compressed size data */}
          {resultUrl && compressedSize > 0 && (
            <div
              className="rounded-md p-3"
              style={{ backgroundColor: "#FAF0E6" }}
            >
              <div className="flex items-center space-x-1 mb-2">
                <Info
                  weight="bold"
                  className="h-4 w-4"
                  style={{ color: "#5C5470" }}
                />
                <Label
                  className="text-sm font-medium"
                  style={{ color: "#352F44" }}
                >
                  File Information
                </Label>
              </div>
              <div className="text-xs space-y-1" style={{ color: "#5C5470" }}>
                {originalSize > 0 && (
                  <div>Original size: {formatFileSize(originalSize)}</div>
                )}
                <div>Compressed size: {formatFileSize(compressedSize)}</div>
                {compressionRatio > 0 && (
                  <div style={{ color: "#352F44" }}>
                    Size reduction: {compressionRatio.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={onDownload}
            disabled={!resultUrl}
            className="w-full py-6 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            style={{
              backgroundColor: !resultUrl ? "#B9B4C7" : "#5C5470",
              color: "#FAF0E6",
            }}
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

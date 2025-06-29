"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Archive, Spinner, ArrowLineRight, Info } from "@phosphor-icons/react";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import { toast } from "sonner";

export default function CompressInterface() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressedImage, setCompressedImage] = useState(null);

  // Compression settings
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState(0);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressImage = useCallback(async () => {
    if (!file || !preview) return;

    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      image.onload = () => {
        // Set canvas dimensions to original image dimensions
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Draw image on canvas
        ctx.drawImage(image, 0, 0);

        // Convert to compressed image
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);

        // Calculate compressed size (approximate)
        const compressedSizeBytes = Math.round(
          (compressedDataUrl.length * 3) / 4,
        );
        setCompressedSize(compressedSizeBytes);

        // Calculate compression ratio
        if (originalSize > 0) {
          const ratio =
            ((originalSize - compressedSizeBytes) / originalSize) * 100;
          setCompressionRatio(Math.max(0, ratio));
        }

        setCompressedImage(compressedDataUrl);

        toast.success("Image compressed successfully!", {
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      };

      image.src = preview;
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to compress image");
    } finally {
      setLoading(false);
    }
  }, [file, preview, quality, originalSize]);

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      setOriginalSize(selectedFile.size);
    }
    setCompressedImage(null);
    setCompressedSize(0);
    setCompressionRatio(0);
  };

  const downloadCompressedImage = () => {
    if (!compressedImage) return;

    const a = document.createElement("a");
    a.href = compressedImage;
    a.download = `compressed-image-${quality}%.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#352F44" }}>
            Compress Image
          </h1>
          <p className="text-sm" style={{ color: "#5C5470" }}>
            Reduce image file sizes while maintaining quality with adjustable
            compression
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-full">
          <UploadCard
            file={file}
            setFile={(newFile) => {
              setFile(newFile);
              handleFileSelection(newFile);
            }}
            preview={preview}
            dragActive={dragActive}
            setDragActive={setDragActive}
            setPreview={setPreview}
            loading={loading}
            onSubmit={compressImage}
            onClearResult={() => {
              setCompressedImage(null);
              setCompressedSize(0);
              setCompressionRatio(0);
            }}
            title="Compress Image"
            description="Upload an image to reduce its file size"
            buttonText="Compress Image"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
          >
            {/* Compression controls - only show when image is loaded */}
            {preview && (
              <div className="space-y-4">
                {/* File size info */}
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
                  <div
                    className="text-xs space-y-1"
                    style={{ color: "#5C5470" }}
                  >
                    <div>Original size: {formatFileSize(originalSize)}</div>
                    {compressedSize > 0 && (
                      <>
                        <div>
                          Compressed size: {formatFileSize(compressedSize)}
                        </div>
                        <div style={{ color: "#352F44" }}>
                          Reduction: {compressionRatio.toFixed(1)}%
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quality slider */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm" style={{ color: "#352F44" }}>
                      Compression Quality: {quality}%
                    </Label>
                    <Input
                      type="range"
                      min="10"
                      max="95"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                      style={{
                        accentColor: "#5C5470",
                      }}
                    />
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: "#5C5470" }}
                    >
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                    <p className="text-xs" style={{ color: "#5C5470" }}>
                      Lower quality = smaller file size, higher quality = larger
                      file size
                    </p>
                  </div>
                </div>
              </div>
            )}
          </UploadCard>
        </div>

        <div className="h-full">
          <ResultCard
            resultUrl={compressedImage}
            resultFormat="jpg"
            originalSize={originalSize}
            compressedSize={compressedSize}
            compressionRatio={compressionRatio}
            onDownload={downloadCompressedImage}
            title="Compressed Result"
            successLabel="Compressed"
            noResultMessage="No compressed image yet"
            noResultSubMessage="Upload and compress an image to see it here"
            downloadButtonText="Download Compressed Image"
            toastMessage="Image compressed successfully!"
          />
        </div>
      </div>
    </div>
  );
}

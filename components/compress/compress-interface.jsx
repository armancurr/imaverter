"use client";

import { useEffect } from "react";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import CompressControls from "./compress-controls";
import CompressCanvas from "./compress-canvas";
import useCompressImage from "@/hooks/use-compress-image";
import useFileStore from "@/stores/use-file-store";

export default function CompressInterface() {
  const { file, preview } = useFileStore();
  const {
    loading,
    compressedImage,
    quality,
    originalSize,
    compressedSize,
    compressionRatio,
    estimatedSize,
    setQuality,
    formatFileSize,
    generateSizeMarkers,
    updateFileSize,
    compressImage,
    downloadCompressedImage,
    clearCompressedImage,
  } = useCompressImage();

  useEffect(() => {
    updateFileSize(file);
  }, [file, updateFileSize]);

  const handleCompressSubmit = () => {
    compressImage(file, preview);
  };

  const sizeMarkers = generateSizeMarkers();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            tabId="compress"
            loading={loading}
            onSubmit={handleCompressSubmit}
            onClearResult={clearCompressedImage}
            title="Compress Image"
            description="Upload an image to reduce its file size"
            buttonText="Compress Image"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={
              <CompressCanvas
                preview={preview}
                onClearResult={clearCompressedImage}
                onFileChange={updateFileSize}
              />
            }
          >
            {preview && originalSize > 0 && (
              <CompressControls
                quality={quality}
                setQuality={setQuality}
                formatFileSize={formatFileSize}
                estimatedSize={estimatedSize}
                sizeMarkers={sizeMarkers}
              />
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
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

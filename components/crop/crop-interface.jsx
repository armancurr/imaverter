"use client";

import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import CropControls from "./crop-controls";
import CropCanvas from "./crop-canvas";
import useCropImage from "@/hooks/use-crop-image";
import useFileStore from "@/stores/use-file-store";

export default function CropInterface() {
  const { file, preview } = useFileStore();
  const {
    crop,
    zoom,
    cornerRadius,
    loading,
    croppedImage,
    setCrop,
    setZoom,
    setCornerRadius,
    onCropComplete,
    createCroppedImage,
    downloadCroppedImage,
    clearCroppedImage,
  } = useCropImage();

  const handleCropSubmit = () => {
    createCroppedImage(preview, file);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            tabId="crop"
            loading={loading}
            onSubmit={handleCropSubmit}
            onClearResult={clearCroppedImage}
            title="Crop Image"
            description="Upload an image and crop it with custom corner radius"
            buttonText="Crop Image"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={
              <CropCanvas
                preview={preview}
                crop={crop}
                setCrop={setCrop}
                zoom={zoom}
                setZoom={setZoom}
                onCropComplete={onCropComplete}
                cornerRadius={cornerRadius}
                onClearResult={clearCroppedImage}
              />
            }
          >
            {preview && (
              <CropControls
                cornerRadius={cornerRadius}
                setCornerRadius={setCornerRadius}
                zoom={zoom}
                setZoom={setZoom}
              />
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
          <ResultCard
            resultUrl={croppedImage}
            resultFormat="png"
            onDownload={downloadCroppedImage}
            title="Cropped Result"
            successLabel="Cropped"
            noResultMessage="No cropped image yet"
            noResultSubMessage="Upload and crop an image to see it here"
            downloadButtonText="Download Cropped Image"
            toastMessage="Image cropped successfully!"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FileImage } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFileStore from "@/stores/use-file-store";
import { toast } from "sonner";

export default function CropCanvas({
  preview,
  crop,
  setCrop,
  onCropComplete,
  onImageLoad,
  cornerRadius,
  onClearResult,
}) {
  const { dragActive, setDragActive, handleFileSelection, setUploadedFrom } =
    useFileStore();

  const handleFileChange = (selectedFile) => {
    if (onClearResult) {
      onClearResult();
    }

    const result = handleFileSelection(selectedFile);

    if (!result.success && result.error) {
      toast.error(result.error, {
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
      return;
    }

    if (selectedFile) {
      setUploadedFrom("crop");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  if (!preview) {
    return (
      <div
        className={`w-full h-full min-h-[280px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center border-neutral-600 ${
          dragActive ? "shadow-lg scale-[1.02]" : "hover:shadow-md"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          id="file-upload-crop"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        <Label
          htmlFor="file-upload-crop"
          className="block cursor-pointer w-full h-full flex items-center justify-center"
        >
          <div className="space-y-2">
            <FileImage className="mx-auto h-10 w-10 text-neutral-400" />
            <div>
              <p className="font-medium text-md text-neutral-200">
                Click to upload or drag and drop
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </div>
        </Label>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ReactCrop
        crop={crop}
        onChange={(crop, percentCrop) => setCrop(percentCrop)}
        onComplete={onCropComplete}
        circularCrop={cornerRadius >= 100}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        <img 
          src={preview} 
          onLoad={onImageLoad}
          alt="Crop preview"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </ReactCrop>
    </div>
  );
}

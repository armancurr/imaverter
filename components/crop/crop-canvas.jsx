"use client";

import dynamic from "next/dynamic";
import { FileImage } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFileStore from "@/stores/use-file-store";
import { toast } from "sonner";

const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

export default function CropCanvas({
  preview,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
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
        className={`flex-1 min-h-[280px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center border-neutral-600 ${
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
    <div className="flex-1 relative overflow-hidden min-h-[280px]">
      <Cropper
        image={preview}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
        cropShape={cornerRadius >= 100 ? "round" : "rect"}
      />
      {cornerRadius > 0 && cornerRadius < 100 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div 
            className="border-2 border-white/60 bg-transparent shadow-lg"
            style={{
              width: "180px",
              height: "180px",
              borderRadius: `${cornerRadius}px`,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.2)"
            }}
          />
        </div>
      )}
    </div>
  );
}

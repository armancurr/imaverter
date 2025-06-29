"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Crop, Spinner, ArrowLineRight } from "@phosphor-icons/react";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import react-easy-crop to avoid SSR issues
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

export default function CropInterface() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [loading, setLoading] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!preview || !croppedAreaPixels) return;

    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      image.onload = () => {
        const { width, height, x, y } = croppedAreaPixels;

        canvas.width = width;
        canvas.height = height;

        // Handle corner radius or circle
        if (cornerRadius > 0) {
          ctx.beginPath();
          if (cornerRadius >= 100) {
            // Create perfect circle
            const radius = Math.min(width, height) / 2;
            ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
          } else {
            // Create rounded rectangle manually for better browser support
            const r = Math.min(cornerRadius, width / 2, height / 2);
            ctx.moveTo(r, 0);
            ctx.lineTo(width - r, 0);
            ctx.quadraticCurveTo(width, 0, width, r);
            ctx.lineTo(width, height - r);
            ctx.quadraticCurveTo(width, height, width - r, height);
            ctx.lineTo(r, height);
            ctx.quadraticCurveTo(0, height, 0, height - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
          }
          ctx.clip();
        }

        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

        const croppedDataUrl = canvas.toDataURL("image/png");
        setCroppedImage(croppedDataUrl);

        toast.success("Image cropped successfully!", {
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
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image");
    } finally {
      setLoading(false);
    }
  };

  const downloadCroppedImage = () => {
    if (!croppedImage) return;

    const a = document.createElement("a");
    a.href = croppedImage;
    a.download = `cropped-image-${cornerRadius >= 100 ? "circle" : `radius-${cornerRadius}`}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Custom cropper area that replaces the standard upload area when image is loaded
  const cropperArea = preview ? (
    <div
      className="flex-1 relative rounded-md overflow-hidden min-h-[320px]"
      style={{ backgroundColor: "#B9B4C7" }}
    >
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
    </div>
  ) : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#352F44" }}>
            Crop Image
          </h1>
          <p className="text-sm" style={{ color: "#5C5470" }}>
            Upload and crop images with custom corner radius or create perfect
            circles
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-full">
          <UploadCard
            file={file}
            setFile={setFile}
            preview={preview}
            dragActive={dragActive}
            setDragActive={setDragActive}
            setPreview={setPreview}
            loading={loading}
            onSubmit={createCroppedImage}
            onClearResult={() => setCroppedImage(null)}
            title="Crop Image"
            description="Upload an image and crop it with custom corner radius"
            buttonText="Crop Image"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={cropperArea}
          >
            {/* Crop controls - only show when image is loaded */}
            {preview && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm" style={{ color: "#352F44" }}>
                    Corner Radius:{" "}
                    {cornerRadius >= 100 ? "Circle" : `${cornerRadius}px`}
                  </Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Number(e.target.value))}
                    className="w-full"
                    style={{
                      accentColor: "#5C5470",
                    }}
                  />
                  <p className="text-xs" style={{ color: "#5C5470" }}>
                    Drag to 100 for perfect circle
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm" style={{ color: "#352F44" }}>
                    Zoom: {zoom.toFixed(2)}
                  </Label>
                  <Input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                    style={{
                      accentColor: "#5C5470",
                    }}
                  />
                </div>
              </div>
            )}
          </UploadCard>
        </div>

        <div className="h-full">
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

"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import { toast } from "sonner";
import dynamic from "next/dynamic";

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

        if (cornerRadius > 0) {
          ctx.beginPath();
          if (cornerRadius >= 100) {
            const radius = Math.min(width, height) / 2;
            ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
          } else {
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

  const cropperArea = preview ? (
    <div className="flex-1 relative rounded-md overflow-hidden min-h-[280px]">
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
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
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
            {preview && (
              <div className="flex gap-3">
                <div className="flex-1 border-2 border-neutral-700 rounded-lg p-3 ">
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-300">
                      Corner Radius
                    </Label>
                    <Slider
                      value={[cornerRadius]}
                      onValueChange={(vals) => setCornerRadius(vals[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="
    w-full
    [&_[data-slot=slider-track]]:bg-neutral-700
    [&_[data-slot=slider-range]]:bg-neutral-200
  "
                    />
                    <div className="text-xs text-neutral-400 text-center">
                      {cornerRadius >= 100 ? "Circle" : `${cornerRadius}px`}
                    </div>
                  </div>
                </div>

                <div className="flex-1 border-2 border-neutral-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-300">
                      Zoom Level
                    </Label>
                    <Slider
                      value={[zoom]}
                      onValueChange={(vals) => setZoom(vals[0])}
                      min={1}
                      max={3}
                      step={0.1}
                      className="
    w-full
    [&_[data-slot=slider-track]]:bg-neutral-700
    [&_[data-slot=slider-range]]:bg-neutral-200
  "
                    />
                    <div className="text-xs text-neutral-400 text-center">
                      {zoom.toFixed(1)}x
                    </div>
                  </div>
                </div>
              </div>
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

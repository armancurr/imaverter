import { useState, useCallback } from "react";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";

export default function useCropImage() {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [loading, setLoading] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const { addRecentImage } = useRecentImages();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (preview, file) => {
    if (!preview || !croppedAreaPixels) return;

    if (file) {
      setCurrentFile(file);
    }

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

        const fileName = (file || currentFile)?.name || "image";
        const shapeDescription =
          cornerRadius >= 100
            ? "Circle crop"
            : cornerRadius > 0
              ? `Rounded crop (${cornerRadius}px)`
              : "Rectangular crop";

        addRecentImage({
          type: "crop",
          originalName: fileName,
          resultUrl: croppedDataUrl,
          format: "png",
          action: shapeDescription,
          downloadName: `${fileName.split(".")[0]}-cropped-${cornerRadius >= 100 ? "circle" : `radius-${cornerRadius}`}.png`,
        });

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

  const clearCroppedImage = () => {
    setCroppedImage(null);
  };

  return {
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
  };
}

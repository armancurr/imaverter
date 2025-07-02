import { useState, useCallback } from "react";
import { toast } from "sonner";
import useRecentImages from "./use-recent-images";

export default function useCropImage() {
  // Start with no initial crop - let user define it
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [loading, setLoading] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const { addRecentImage } = useRecentImages();

  const onImageLoad = useCallback((e) => {
    setImgRef(e.currentTarget);
    // Set a default crop when image loads (centered 70% crop)
    const { width, height } = e.currentTarget;
    const defaultCrop = {
      unit: '%',
      x: 15,
      y: 15,
      width: 70,
      height: 70
    };
    setCrop(defaultCrop);
  }, []);

  const onCropComplete = useCallback((crop, percentCrop) => {
    setCompletedCrop(crop);
  }, []);

  const createCroppedImage = async (file) => {
    if (!imgRef || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      toast.error("Please select a crop area first");
      return;
    }

    if (file) {
      setCurrentFile(file);
    }

    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Calculate scale factors between displayed image and actual image
      const scaleX = imgRef.naturalWidth / imgRef.width;
      const scaleY = imgRef.naturalHeight / imgRef.height;
      
      // Use device pixel ratio for crisp images on high DPI displays
      const pixelRatio = window.devicePixelRatio;
      
      // Calculate actual crop dimensions
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // Set canvas size accounting for pixel ratio
      canvas.width = cropWidth * pixelRatio;
      canvas.height = cropHeight * pixelRatio;
      
      // Scale the canvas back down using CSS
      canvas.style.width = cropWidth + 'px';
      canvas.style.height = cropHeight + 'px';
      
      // Scale the drawing context so everything draws at the correct size
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      // Apply corner radius clipping if specified
      if (cornerRadius > 0) {
        ctx.beginPath();
        if (cornerRadius >= 100) {
          // Circle crop - use the smaller dimension as diameter
          const radius = Math.min(cropWidth, cropHeight) / 2;
          const centerX = cropWidth / 2;
          const centerY = cropHeight / 2;
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        } else {
          // Rounded rectangle crop
          const r = Math.min(cornerRadius, cropWidth / 2, cropHeight / 2);
          ctx.moveTo(r, 0);
          ctx.lineTo(cropWidth - r, 0);
          ctx.quadraticCurveTo(cropWidth, 0, cropWidth, r);
          ctx.lineTo(cropWidth, cropHeight - r);
          ctx.quadraticCurveTo(cropWidth, cropHeight, cropWidth - r, cropHeight);
          ctx.lineTo(r, cropHeight);
          ctx.quadraticCurveTo(0, cropHeight, 0, cropHeight - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
        }
        ctx.clip();
      }

      // Draw the cropped image
      ctx.drawImage(
        imgRef,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Convert to data URL
      const croppedDataUrl = canvas.toDataURL("image/png", 1.0);
      setCroppedImage(croppedDataUrl);

      // Add to recent images
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
    setCompletedCrop(null);
    // Reset crop to default when clearing
    if (imgRef) {
      const defaultCrop = {
        unit: '%',
        x: 15,
        y: 15,
        width: 70,
        height: 70
      };
      setCrop(defaultCrop);
    }
  };

  return {
    crop,
    cornerRadius,
    loading,
    croppedImage,
    setCrop,
    setCornerRadius,
    onImageLoad,
    onCropComplete,
    createCroppedImage,
    downloadCroppedImage,
    clearCroppedImage,
  };
}

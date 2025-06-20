"use client";

import {
  UploadSimple,
  FileImage,
  Spinner,
  ArrowLineRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

export default function UploadCard({
  // File handling
  file,
  setFile,
  preview,
  dragActive,
  setDragActive,
  setPreview,

  // Action handling
  loading,
  onSubmit,
  onClearResult,

  // UI customization
  title = "Upload Image",
  description = "Select an image to process",
  buttonText = "Process Image",
  acceptedFormats = "PNG, JPG, WEBP up to 10MB",

  // Additional controls (optional)
  children,

  // Custom content to replace upload area (for cropper)
  customContent,
}) {
  const handleFileChange = (selectedFile) => {
    // Clear previous results when new file is selected
    if (onClearResult) {
      onClearResult();
    }

    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB.", {
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss();
            },
          },
        });
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
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

  return (
    <Card className="flex flex-col border-none bg-neutral-900/90 lg:h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-neutral-200">
          <UploadSimple className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-auto">
          {/* Use custom content if provided, otherwise use default upload area */}
          {customContent ? (
            customContent
          ) : (
            <div
              className={`rounded-md border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 h-[280px] flex items-center justify-center ${
                dragActive
                  ? "border-[#e6fda3] bg-[#e6fda3]/5"
                  : file
                    ? "border-[#e6fda3] bg-[#e6fda3]/5"
                    : "border-neutral-700 hover:border-neutral-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                id="file-upload-shared"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <label
                htmlFor="file-upload-shared"
                className="block cursor-pointer"
              >
                {preview ? (
                  <div className="space-y-3">
                    <Image
                      src={preview}
                      alt="Preview"
                      className="mx-auto rounded-md object-contain max-h-[240px] max-w-full"
                      width={400}
                      height={400}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileImage className="mx-auto h-10 w-10 text-neutral-500" />
                    <div>
                      <p className="font-medium text-neutral-300">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {acceptedFormats}
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-6">
          {/* Render any additional controls passed as children */}
          {children}

          {/* Submit button */}
          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={!file || loading}
              className="w-full bg-neutral-700 py-6 mt-2 text-neutral-200 hover:bg-neutral-700/70 transition-colors duration-200 cursor-pointer"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner className="h-5 w-5 animate-spin" />
                </>
              ) : (
                <>
                  {buttonText}
                  <ArrowLineRight weight="bold" className="ml-1 h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

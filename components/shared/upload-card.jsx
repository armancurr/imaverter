"use client";

import { useRef } from "react";
import {
  UploadSimple,
  FileImage,
  Spinner,
  ArrowLineRight,
  Scissors,
  Resize,
  Palette,
  Recycle,
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
import { Label } from "@/components/ui/label";
import useFileStore from "@/stores/use-file-store";

export default function UploadCard({
  loading,
  onSubmit,
  onClearResult,
  title = "Upload Image",
  description = "Select an image to process",
  buttonText = "Process Image",
  acceptedFormats = "PNG, JPG, WEBP up to 10MB",
  children,
  customContent,
  tabId,
}) {
  const fileInputRef = useRef(null);
  const newUploadInputRef = useRef(null);

  const {
    file,
    preview,
    dragActive,
    setDragActive,
    handleFileSelection,
    setUploadedFrom,
    clearFile,
  } = useFileStore();

  const iconMap = {
    crop: Scissors,
    convert: Recycle,
    compress: Resize,
    "color-palette": Palette,
  };

  const Icon = iconMap[tabId] || UploadSimple;

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

    if (selectedFile && tabId) {
      setUploadedFrom(tabId);
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

  const handleNewUpload = () => {
    newUploadInputRef.current?.click();
  };

  const handleNewFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (onClearResult) {
      onClearResult();
    }
    clearFile();

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

    if (selectedFile && tabId) {
      setUploadedFrom(tabId);
    }
  };

  return (
    <Card className="flex flex-col border shadow-sm h-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 overflow-hidden rounded-xl">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-neutral-200">
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-6 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {customContent ? (
            <div className="flex-1 flex flex-col min-h-0">{customContent}</div>
          ) : (
            <div
              className={`flex-1 min-h-[280px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center border-neutral-600 ${
                dragActive
                  ? "shadow-lg scale-[1.02]"
                  : file
                    ? "shadow-md"
                    : "hover:shadow-md"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                ref={fileInputRef}
                id="file-upload-shared"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <Label
                htmlFor="file-upload-shared"
                className="block cursor-pointer w-full h-full flex items-center justify-center"
              >
                {preview ? (
                  <div className="space-y-3 w-full">
                    <Image
                      src={preview}
                      alt="Preview"
                      className="mx-auto rounded-md object-contain max-h-[240px] max-w-full"
                      width={400}
                      height={400}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileImage className="mx-auto h-10 w-10 text-neutral-400" />
                    <div>
                      <p className="font-medium text-md text-neutral-200">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-2 text-xs text-neutral-400">
                        {acceptedFormats}
                      </p>
                    </div>
                  </div>
                )}
              </Label>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-4 flex-shrink-0">
          <div className="max-h-32 overflow-y-auto">{children}</div>
          {onSubmit && (
            <div className="flex gap-2">
              <Button
                onClick={onSubmit}
                disabled={!file || loading}
                className="flex-1 py-4 cursor-pointer bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-200 hover:from-neutral-800 hover:to-neutral-900 transition-colors duration-200"
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
              {file && (
                <>
                  <Input
                    ref={newUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleNewFileChange(e.target.files[0])}
                  />
                  <Button
                    onClick={handleNewUpload}
                    disabled={loading}
                    className="py-4 cursor-pointer bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-200 hover:from-neutral-800 hover:to-neutral-900 transition-colors duration-200"
                    size="lg"
                  >
                    <UploadSimple className="h-5 w-5" />
                    <span>Upload New Image</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

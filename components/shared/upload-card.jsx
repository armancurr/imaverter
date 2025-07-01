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
  file,
  setFile,
  preview,
  dragActive,
  setDragActive,
  setPreview,
  loading,
  onSubmit,
  onClearResult,
  title = "Upload Image",
  description = "Select an image to process",
  buttonText = "Process Image",
  acceptedFormats = "PNG, JPG, WEBP up to 10MB",
  children,
  customContent,
}) {
  const handleFileChange = (selectedFile) => {
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
    <Card
      className="flex flex-col border shadow-lg h-full"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#B9B4C7",
      }}
    >
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle
          className="flex items-center space-x-2"
          style={{ color: "#352F44" }}
        >
          <UploadSimple className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription style={{ color: "#5C5470" }}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-6">
        <div className="flex-1 flex flex-col">
          {customContent ? (
            <div className="flex-1 flex flex-col">{customContent}</div>
          ) : (
            <div
              className={`flex-1 min-h-[320px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center ${
                dragActive
                  ? "shadow-lg scale-[1.02]"
                  : file
                    ? "shadow-md"
                    : "hover:shadow-md"
              }`}
              style={{
                borderColor: dragActive || file ? "#5C5470" : "#B9B4C7",
                backgroundColor: dragActive || file ? "#FAF0E6" : "#FFFFFF",
              }}
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
                className="block cursor-pointer w-full h-full flex items-center justify-center"
              >
                {preview ? (
                  <div className="space-y-3 w-full">
                    <Image
                      src={preview}
                      alt="Preview"
                      className="mx-auto rounded-md object-contain max-h-[280px] max-w-full"
                      width={400}
                      height={400}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileImage
                      className="mx-auto h-12 w-12"
                      style={{ color: "#5C5470" }}
                    />
                    <div>
                      <p
                        className="font-medium text-lg"
                        style={{ color: "#352F44" }}
                      >
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-2 text-sm" style={{ color: "#5C5470" }}>
                        {acceptedFormats}
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-6 flex-shrink-0">
          {children}
          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={!file || loading}
              className="w-full py-6 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{
                backgroundColor: !file || loading ? "#B9B4C7" : "#5C5470",
                color: "#FAF0E6",
              }}
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

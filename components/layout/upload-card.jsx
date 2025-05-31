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
import FormatSelector from "./format-selector";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

export default function UploadCard({
  file,
  setFile,
  format,
  setFormat,
  formatOptions,
  loading,
  handleSubmit,
  preview,
  dragActive,
  setDragActive,
  setPreview,
  setConvertedUrl,
}) {
  const handleFileChange = (selectedFile) => {
    setConvertedUrl(null);

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
          <span>Upload Image</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Select an image to convert to your desired format
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-auto">
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
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            <label htmlFor="file-upload" className="block cursor-pointer">
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
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <FormatSelector
            format={format}
            setFormat={setFormat}
            formatOptions={formatOptions}
          />

          <Button
            onClick={handleSubmit}
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
                Convert to {format.toUpperCase()}
                <ArrowLineRight weight="bold" className="ml-1 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

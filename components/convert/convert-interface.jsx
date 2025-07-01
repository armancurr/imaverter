"use client";

import { useState } from "react";
import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import FormatSelector from "./format-selector";
import Image from "next/image";

export default function ConvertInterface() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpg");
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const formatOptions = [
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WEBP" },
    { value: "avif", label: "AVIF" },
    { value: "bmp", label: "BMP" },
    { value: "ico", label: "ICO" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setConvertedUrl(data.url);
      } else {
        const errorData = await res.json();
        console.error("Conversion failed:", errorData);
        alert(
          `Conversion failed: ${errorData.error}${
            errorData.details ? "\n\n" + errorData.details : ""
          }`,
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("An error occurred during conversion!");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!convertedUrl) return;
    const response = await fetch(convertedUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const previewArea = preview ? (
    <div className="flex-1 relative rounded-md overflow-hidden min-h-[280px] flex items-center justify-center">
      <Image
        src={preview}
        alt="Preview"
        width={800}
        height={600}
        className="max-w-full max-h-full object-contain"
        unoptimized
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
            onSubmit={handleSubmit}
            onClearResult={() => setConvertedUrl(null)}
            title="Upload Image"
            description="Select an image to convert to your desired format"
            buttonText={`Convert to ${format.toUpperCase()}`}
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={previewArea}
          >
            {preview && (
              <FormatSelector
                format={format}
                setFormat={setFormat}
                formatOptions={formatOptions}
              />
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
          <ResultCard
            resultUrl={convertedUrl}
            resultFormat={format}
            onDownload={downloadImage}
            title="Converted Image"
            successLabel="Converted"
            noResultMessage="No converted image yet"
            noResultSubMessage="Upload and convert an image to see it here"
          />
        </div>
      </div>
    </div>
  );
}

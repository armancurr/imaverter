"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import UploadCard from "@/components/layout/upload-card";
import ResultCard from "@/components/layout/result-card";

export default function Home() {
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
    { value: "gif", label: "GIF" },
    { value: "tiff", label: "TIFF" },
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <div>
        <Header />
      </div>

      <div className="container mx-auto px-6 py-2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:h-[calc(100vh-170px)]">
          <div>
            <UploadCard
              file={file}
              setFile={setFile}
              format={format}
              setFormat={setFormat}
              formatOptions={formatOptions}
              loading={loading}
              handleSubmit={handleSubmit}
              preview={preview}
              dragActive={dragActive}
              setDragActive={setDragActive}
              setPreview={setPreview}
              setConvertedUrl={setConvertedUrl}
            />
          </div>

          <div>
            <ResultCard
              convertedUrl={convertedUrl}
              format={format}
              downloadImage={downloadImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

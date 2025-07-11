"use client";

import { FileImage, Plus, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import useFileStore from "@/stores/use-file-store";
import { toast } from "sonner";
import { useRef } from "react";

export default function ConvertCanvas({ onClearResult }) {
  const fileInputRef = useRef(null);
  const multiFileInputRef = useRef(null);
  
  const {
    dragActive,
    setDragActive,
    convertFiles,
    convertPreviews,
    addConvertFile,
    removeConvertFile,
    clearConvertFiles,
    handleMultipleConvertFiles,
    handleConvertFileSelection,
    setUploadedFrom,
  } = useFileStore();

  const MAX_FILES = 3;

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    const result = handleConvertFileSelection(selectedFile);
    
    if (!result.success && result.error) {
      toast.error(result.error, {
        action: { label: "Close", onClick: () => toast.dismiss() },
      });
      return;
    }

    setUploadedFrom("convert");
  };

  const handleMultipleFiles = (files) => {
    const result = handleMultipleConvertFiles(files);
    
    if (!result.success && result.error) {
      toast.error(result.error, {
        action: { label: "Close", onClick: () => toast.dismiss() },
      });
    } else if (result.addedCount > 0) {
      toast.success(`Added ${result.addedCount} image${result.addedCount > 1 ? 's' : ''}`, {
        action: { label: "Close", onClick: () => toast.dismiss() },
      });
      setUploadedFrom("convert");
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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleMultipleFiles(files);
    }
  };

  const handleRemoveImage = (index) => {
    removeConvertFile(index);
    if (onClearResult) {
      onClearResult();
    }
  };

  const handleAddMoreClick = () => {
    if (convertFiles.length >= MAX_FILES) return;
    multiFileInputRef.current?.click();
  };

  const handleClearAll = () => {
    clearConvertFiles();
    if (onClearResult) {
      onClearResult();
    }
  };

  // If no images uploaded, show upload area
  if (convertFiles.length === 0) {
    return (
      <div
        className={`flex-1 min-h-[280px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center border-neutral-600 ${
          dragActive ? "shadow-lg scale-[1.02] border-neutral-500" : "hover:shadow-md"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={fileInputRef}
          id="file-upload-convert"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
        
        <Input
          ref={multiFileInputRef}
          id="multi-file-upload-convert"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleMultipleFiles(e.target.files)}
        />

        <Label
          htmlFor="file-upload-convert"
          className="block cursor-pointer w-full h-full flex items-center justify-center"
        >
          <div className="space-y-2">
            <FileImage className="mx-auto h-10 w-10 text-neutral-400" />
            <div>
              <p className="font-medium text-md text-neutral-200">
                Click to upload or drag and drop
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                PNG, JPG, WEBP up to 10MB each (1-3 images)
              </p>
            </div>
          </div>
        </Label>
      </div>
    );
  }

  // Show image grid with controls
  return (
    <div className="flex-1 min-h-[280px] space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleClearAll}
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-neutral-200 h-7 px-2"
        >
          Clear All
        </Button>
      </div>

      {/* Dynamic Image Layout */}
      <div 
        className="flex-1 flex items-center justify-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={`
          flex gap-3 transition-all duration-300 ease-out
          ${convertFiles.length === 1 ? 'justify-center' : 'justify-center flex-wrap'}
        `}>
          {convertPreviews.map((preview, index) => (
            <div
              key={index}
              className={`
                relative group bg-neutral-800 rounded-lg overflow-hidden transition-all duration-300 ease-out
                ${convertFiles.length === 1 
                  ? 'w-64 h-64' // Single image: Large and centered
                  : convertFiles.length === 2 
                  ? 'w-40 h-40' // Two images: Medium size
                  : 'w-32 h-32' // Three images: Small size
                }
              `}
              style={{
                transform: convertFiles.length > 1 ? 'translateX(0)' : 'none'
              }}
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes={convertFiles.length === 1 ? "256px" : convertFiles.length === 2 ? "160px" : "128px"}
              />
              
              {/* Remove button */}
              <Button
                onClick={() => handleRemoveImage(index)}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-600 hover:bg-red-700 z-10"
              >
                <X className="h-3 w-3" />
              </Button>

              {/* File name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-xs text-white truncate transition-all duration-200">
                {convertFiles[index]?.name}
              </div>
              
              {/* Image number indicator */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Hidden file inputs */}
      <Input
        ref={multiFileInputRef}
        id="multi-file-upload-convert-grid"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleMultipleFiles(e.target.files)}
      />
    </div>
  );
}

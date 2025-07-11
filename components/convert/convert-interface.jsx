"use client";

import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import ConvertControls from "./convert-controls";
import ConvertCanvas from "./convert-canvas";
import useConvertImage from "@/hooks/use-convert-image";
import useFileStore from "@/stores/use-file-store";
import Image from "next/image";
import { toast } from "sonner";

export default function ConvertInterface() {
  const { convertFiles, clearConvertFiles } = useFileStore();
  const {
    format,
    convertedUrl,
    convertedImages,
    loading,
    conversionProgress,
    formatOptions,
    setFormat,
    convertImage,
    downloadConvertedImage,
    clearConvertedImage,
  } = useConvertImage();

  const handleConvertSubmit = () => {
    convertImage(convertFiles);
  };

  const handleClearResult = () => {
    clearConvertedImage();
    // Don't clear convert files here - that should only happen when user explicitly clears all
  };

  const handleClearAll = () => {
    clearConvertedImage();
    clearConvertFiles();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      {/* Progress indicator */}
      {loading && conversionProgress.total > 0 && (
        <div className="mb-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-200">
              Converting images... ({conversionProgress.current}/{conversionProgress.total})
            </span>
            <span className="text-xs text-neutral-400">
              {Math.round((conversionProgress.current / conversionProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(conversionProgress.current / conversionProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            tabId="convert"
            loading={loading}
            onSubmit={convertFiles.length > 0 ? handleConvertSubmit : null}
            onClearResult={handleClearResult}
            title={convertFiles.length === 1 ? "Convert Image" : "Convert Images"}
            description="Select images to convert to your desired format (up to 3)"
            buttonText={convertFiles.length === 1 ? `Convert to ${format.toUpperCase()}` : convertFiles.length > 1 ? `Convert ${convertFiles.length} Images to ${format.toUpperCase()}` : `Convert to ${format.toUpperCase()}`}
            acceptedFormats="PNG, JPG, WEBP up to 10MB each (1-3 images)"
            customContent={
              <ConvertCanvas
                onClearResult={handleClearResult}
              />
            }
          >
            {convertFiles.length > 0 && (
              <ConvertControls
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
            onDownload={downloadConvertedImage}
            title={convertedImages.length === 1 ? "Converted Image" : "Converted Images"}
            successLabel="Converted"
            noResultMessage={loading && conversionProgress.total > 0 ? `Converting ${conversionProgress.current}/${conversionProgress.total}...` : "No converted images yet"}
            noResultSubMessage={loading ? "Please wait while we process your images" : "Upload and convert images to see them here"}
            downloadButtonText={convertedImages.length === 1 ? "Download Image" : convertedImages.length > 1 ? "Download All Images" : "Download Images"}
            toastMessage={convertedImages.length === 1 ? "Image converted successfully!" : "Images converted successfully!"}
            customContent={convertedImages.length > 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className={`
                  flex gap-3 transition-all duration-300 ease-out
                  ${convertedImages.length === 1 ? 'justify-center' : 'justify-center flex-wrap'}
                `}>
                  {convertedImages.map((image, index) => (
                    <div
                      key={index}
                      className={`
                        relative group transition-all duration-300 ease-out
                        ${convertedImages.length === 1 
                          ? 'w-64 h-64' // Single image: Large and centered
                          : convertedImages.length === 2 
                          ? 'w-40 h-40' // Two images: Medium size
                          : 'w-32 h-32' // Three images: Small size
                        }
                      `}
                    >
                      {image.success ? (
                        <div className="relative w-full h-full bg-neutral-800 rounded-lg overflow-hidden">
                          {image.url.startsWith('data:') ? (
                            <img
                              src={image.url}
                              alt={`Converted ${image.originalName}`}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <Image
                              src={image.url}
                              alt={`Converted ${image.originalName}`}
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                              sizes={convertedImages.length === 1 ? "256px" : convertedImages.length === 2 ? "160px" : "128px"}
                              unoptimized
                            />
                          )}
                          
                          {/* File name overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-xs text-white truncate transition-all duration-200">
                            {image.originalName}
                          </div>
                          
                          {/* Image number indicator */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-medium">
                            {index + 1}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-red-950/20 border border-red-600 rounded-lg flex items-center justify-center">
                          <div className="text-center p-4">
                            <div className="text-red-400 text-xs font-medium mb-1">Failed</div>
                            <div className="text-red-400 text-xs">{image.error}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          />
        </div>
      </div>
    </div>
  );
}

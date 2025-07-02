"use client";

import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import ConvertControls from "./convert-controls";
import ConvertCanvas from "./convert-canvas";
import useConvertImage from "@/hooks/use-convert-image";
import useFileStore from "@/stores/use-file-store";

export default function ConvertInterface() {
  const { file, preview } = useFileStore();
  const {
    format,
    convertedUrl,
    loading,
    formatOptions,
    setFormat,
    convertImage,
    downloadConvertedImage,
    clearConvertedImage,
  } = useConvertImage();

  const handleConvertSubmit = () => {
    convertImage(file);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            tabId="convert"
            loading={loading}
            onSubmit={handleConvertSubmit}
            onClearResult={clearConvertedImage}
            title="Convert Image"
            description="Select an image to convert to your desired format"
            buttonText={`Convert to ${format.toUpperCase()}`}
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={
              <ConvertCanvas
                preview={preview}
                onClearResult={clearConvertedImage}
              />
            }
          >
            {preview && (
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
            title="Converted Image"
            successLabel="Converted"
            noResultMessage="No converted image yet"
            noResultSubMessage="Upload and convert an image to see it here"
            downloadButtonText="Download Converted Image"
            toastMessage="Image converted successfully!"
          />
        </div>
      </div>
    </div>
  );
}

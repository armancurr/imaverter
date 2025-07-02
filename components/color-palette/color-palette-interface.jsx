"use client";

import UploadCard from "@/components/shared/upload-card";
import ResultCard from "@/components/shared/result-card";
import ColorPaletteControls from "./color-palette-controls";
import ColorPaletteCanvas from "./color-palette-canvas";
import ColorPaletteResult from "./color-palette-result";
import useColorPalette from "@/hooks/use-color-palette";
import useFileStore from "@/stores/use-file-store";
import { Palette } from "@phosphor-icons/react";

export default function ColorPaletteInterface() {
  const { file, preview } = useFileStore();
  const {
    loading,
    palette,
    numColors,
    setNumColors,
    extractPalette,
    handleCopyAll,
    handleCopyHex,
    clearPalette,
  } = useColorPalette();

  const handleExtractSubmit = () => {
    extractPalette(preview, file);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        <div className="h-full min-h-0">
          <UploadCard
            tabId="color-palette"
            loading={loading}
            onSubmit={handleExtractSubmit}
            onClearResult={clearPalette}
            title="Extract Palette"
            description="Upload an image to extract its color palette"
            buttonText="Extract Palette"
            acceptedFormats="PNG, JPG, WEBP up to 10MB"
            customContent={
              <ColorPaletteCanvas
                preview={preview}
                onClearResult={clearPalette}
              />
            }
          >
            {preview && (
              <ColorPaletteControls
                numColors={numColors}
                setNumColors={setNumColors}
              />
            )}
          </UploadCard>
        </div>

        <div className="h-full min-h-0">
          <ResultCard
            resultUrl={palette.length > 0 ? "palette-extracted" : null}
            resultFormat="palette"
            onDownload={handleCopyAll}
            title="Extracted Palette"
            description={
              palette.length > 0
                ? `${palette.length} colors extracted from your image`
                : "Color palette will appear here"
            }
            successLabel="Extracted"
            noResultMessage="No palette yet"
            noResultSubMessage="Upload and extract a palette to see it here"
            downloadButtonText="Copy All Hex Codes"
            toastMessage="Palette extracted successfully!"
            showToast={false}
            customIcon={<Palette className="h-5 w-5" />}
            customContent={
              <ColorPaletteResult palette={palette} onCopyHex={handleCopyHex} />
            }
          />
        </div>
      </div>
    </div>
  );
}

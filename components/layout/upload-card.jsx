import {
  UploadSimple,
  FileImage,
  Spinner,
  ArrowRight,
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
    setFile(selectedFile);
    setConvertedUrl(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
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
    <Card className="flex flex-col border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-white">
          <UploadSimple className="h-5 w-5" />
          <span>Upload Image</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Select an image to convert to your desired format
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-6">
        <div className="flex-1 space-y-6">
          <div
            className={`rounded-md border-2 border-dashed p-16 text-center transition-all duration-200 ${
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="block cursor-pointer">
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto h-32 max-w-full rounded-md object-contain"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <FileImage className="mx-auto h-12 w-12 text-neutral-500" />
                  <div>
                    <p className="font-medium text-neutral-300">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      PNG, JPG, WEBP, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          <FormatSelector
            format={format}
            setFormat={setFormat}
            formatOptions={formatOptions}
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full bg-[#e6fda3] py-6 text-neutral-950 hover:bg-[#e6fda3]/70 transition-colors duration-200 cursor-pointer"
            size="lg"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert to {format.toUpperCase()}
                <ArrowRight weight="bold" className="ml-1 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

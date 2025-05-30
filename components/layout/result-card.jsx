import { DownloadSimple, Image, ArrowLineDown } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResultCard({ convertedUrl, format, downloadImage }) {
  return (
    <Card className="flex flex-col border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-white">
          <DownloadSimple className="h-5 w-5" />
          <span>Converted Image</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          {convertedUrl
            ? "Your converted image is ready for download"
            : "Converted image will appear here"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {convertedUrl ? (
          <div className="flex h-full flex-col space-y-6">
            <div className="flex flex-1 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
              <img
                src={convertedUrl}
                alt="Converted"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>

            <div className="space-y-4">
              <Button
                onClick={downloadImage}
                className="w-full py-6 bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition-colors duration-200"
                size="lg"
              >
                Download {format.toUpperCase()}
                <ArrowLineDown weight="bold" className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
                <Image className="h-10 w-10 text-neutral-600" />
              </div>
              <div>
                <p className="text-neutral-400">No converted image yet</p>
                <p className="text-sm text-neutral-500">
                  Upload and convert an image to see it here
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

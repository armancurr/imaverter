import {
  DownloadSimple,
  Image,
  CheckCircle,
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ResultCard({
  convertedUrl,
  format,
  downloadImage,
}) {
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
      <CardContent className="flex-1">
        {convertedUrl ? (
          <div className="flex h-full flex-col space-y-6">
            {/* Preview */}
            <div className="flex flex-1 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
              <img
                src={convertedUrl}
                alt="Converted"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>

            <Separator className="bg-neutral-800" />

            {/* Download Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-[#e6fda3] text-neutral-950"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Conversion Complete
                </Badge>
                <Badge
                  variant="outline"
                  className="border-neutral-700 text-neutral-300"
                >
                  {format.toUpperCase()}
                </Badge>
              </div>

              <Button
                onClick={downloadImage}
                className="w-full border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                size="lg"
              >
                <DownloadSimple className="mr-2 h-5 w-5" />
                Download {format.toUpperCase()}
              </Button>

              <p className="text-center text-xs text-neutral-500">
                Note: Images are automatically deleted after 24 hours
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
                <Image className="h-10 w-10 text-neutral-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-400">
                  No converted image yet
                </p>
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
"use client";

import React, { useEffect } from "react";
import {
  DownloadSimple,
  ImageSquare,
  ArrowLineDown,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResultCard({ convertedUrl, format, downloadImage }) {
  useEffect(() => {
    if (convertedUrl) {
      toast.success("Image processed. Download it now.", {
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    }
  }, [convertedUrl]);

  return (
    <Card className="flex flex-col border-none bg-neutral-900/90 lg:h-full">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-neutral-200">
          <DownloadSimple className="h-5 w-5" />
          <span>Converted Image</span>
        </CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          {convertedUrl
            ? "Your converted image is ready for download"
            : "Converted image will appear here"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="mb-auto">
          <div
            className={`rounded-md border-2 p-6 sm:p-8 text-center transition-all duration-200 h-[280px] flex items-center justify-center ${
              convertedUrl ? "border-[#e6fda3]/5 bg-[#e6fda3]/5" : "border-none"
            }`}
          >
            {convertedUrl ? (
              <div className="space-y-3">
                <Image
                  src={convertedUrl}
                  alt="Converted"
                  className="mx-auto rounded-md object-contain max-h-[240px] max-w-full"
                  width={400}
                  height={400}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <ImageSquare className="mx-auto h-10 w-10 text-neutral-500" />
                <div>
                  <p className="font-medium text-neutral-300">
                    No converted image yet
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Upload and convert an image to see it here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {convertedUrl && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <CheckCircle weight="bold" className="h-4 w-4 text-[#e6fda3]" />
                <Label className="text-sm font-medium text-neutral-200">
                  Converted
                </Label>
              </div>
              <p className="text-xs text-neutral-500">
                Image processed in {format.toUpperCase()} format
              </p>
            </div>
          )}

          <Button
            onClick={downloadImage}
            disabled={!convertedUrl}
            className="w-full py-6 mt-2 bg-neutral-700 hover:bg-neutral-700/70 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Download {format.toUpperCase()}
            <ArrowLineDown weight="bold" className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

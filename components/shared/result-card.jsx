'use client';

import React, { useEffect } from 'react';
import {
  DownloadSimple,
  ImageSquare,
  ArrowLineDown,
  Info,
} from '@phosphor-icons/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ResultCard({
  resultUrl,
  resultFormat,
  originalSize,
  compressedSize,
  compressionRatio,
  onDownload,
  title = 'Processed Image',
  description,
  downloadButtonText,
  noResultMessage = 'No converted image yet',
  noResultSubMessage = 'Upload and convert an image to see it here',
  showToast = true,
  toastMessage = 'Image processed. Download it now.',
  customContent = null,
  customIcon = null,
}) {
  const finalDescription =
    description ||
    (resultUrl
      ? 'Your processed image is ready for download'
      : 'Processed image will appear here');

  const finalDownloadButtonText =
    downloadButtonText ||
    (resultFormat
      ? `Download ${resultFormat.toUpperCase()}`
      : 'Download Image');

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (resultUrl && showToast) {
      toast.success(toastMessage, {
        action: { label: 'Close', onClick: () => toast.dismiss() },
      });
    }
  }, [resultUrl, showToast, toastMessage]);

  return (
    <Card className="h-full flex flex-col border shadow-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 overflow-hidden rounded-xl">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-neutral-100">
          {customIcon || <DownloadSimple className="h-5 w-5" />}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-sm text-neutral-400">
          {finalDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-6 min-h-0">
        <div className="flex-1 min-h-0">
          {resultUrl ? (
            customContent ? (
              <div className="h-full overflow-y-auto">{customContent}</div>
            ) : (
              <div className="w-full h-full min-h-[280px] flex items-center justify-center">
                {resultFormat === 'ico' ? (
                  <div>
                    <Image
                      src={resultUrl}
                      alt="ICO file preview"
                      className="object-contain"
                      width={0}
                      height={0}
                      sizes="100vw"
                      unoptimized
                      style={{ 
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '200px',
                        maxHeight: '200px',
                        imageRendering: 'pixelated',
                        imageRendering: '-moz-crisp-edges',
                        imageRendering: 'crisp-edges'
                      }}
                    />
                  </div>
                ) : (
                  <Image
                    src={resultUrl}
                    alt="Processed result"
                    className="max-w-full max-h-full object-contain pb-10"
                    width={800}
                    height={600}
                    unoptimized
                  />
                )}
              </div>
            )
          ) : (
            <div className="space-y-2 text-center flex flex-col items-center justify-center h-full">
              <ImageSquare className="mx-auto h-10 w-10 text-neutral-500" />
              <div>
                <p className="font-medium text-md text-neutral-200">
                  {noResultMessage}
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {noResultSubMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {onDownload && (
          <div className="space-y-4 mt-4 flex-shrink-0">
            {resultUrl && compressedSize > 0 && (
              <div className="rounded-md p-3 bg-neutral-800 border border-neutral-700">
                <div className="flex items-center space-x-1 mb-3">
                  <Info weight="bold" className="h-4 w-4 text-neutral-400" />
                  <Label className="text-sm font-medium text-neutral-200">
                    File Size Comparison
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Original:</span>
                    <span className="text-xs text-neutral-200">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">
                      Compressed:
                    </span>
                    <span className="text-xs text-neutral-200">
                      {formatFileSize(compressedSize)}
                    </span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-neutral-300">
                        Reduction:
                      </span>
                      <span className="text-xs font-medium text-green-400">
                        {compressionRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={onDownload}
              disabled={!resultUrl}
              className="w-full py-4 cursor-pointer bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-200 hover:from-neutral-800 hover:to-neutral-900 transition-colors duration-200"
              size="lg"
            >
              {finalDownloadButtonText}
              <ArrowLineDown weight="bold" className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
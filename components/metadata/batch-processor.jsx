'use client';

import { useState } from 'react';
import {
  Upload, // Corrected: Changed from UploadCloud to Upload
  X,
  Spinner,
  ArrowLineRight,
  CheckCircle,
  XCircle,
  DownloadSimple,
  Database,
  Scissors,
  ListBullets,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
// Assuming these utils exist and are correct
import {
  validateImageFile,
  formatFileSize,
} from '@/lib/metadata/metadata-utils';

export default function BatchProcessor() {
  const [files, setFiles] = useState([]);
  const [operation, setOperation] = useState('extract');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFilesSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      try {
        validateImageFile(file);
        validFiles.push(file);
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    });

    setFiles((prev) => [...prev, ...validFiles]);
    if (errors.length > 0) {
      toast.error(`Some files were rejected`, {
        description: errors.join('\n'),
      });
    }
  };

  const processBatch = async () => {
    if (!files.length) {
      toast.error('No files selected for processing.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('operation', operation);

    try {
      const response = await fetch('/api/metadata/batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Server returned an error' }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setResults(result);
      toast.success('Batch processing complete!');
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('Batch processing failed', {
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadResults = () => {
    if (!results) return;

    if (operation === 'extract') {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `batch_metadata_extraction_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (operation === 'strip') {
      const successfulResults = results.results.filter(
        (r) => r.success && r.processedFile
      );
      if (successfulResults.length > 0) {
        successfulResults.forEach((result) => {
          const binaryString = atob(result.processedFile.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: result.processedFile.type });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.processedFile.filename;
          link.click();
          URL.revokeObjectURL(url);
        });
        toast.success(`Downloading ${successfulResults.length} stripped files.`);
      } else {
        toast.error('No files were successfully stripped to download.');
      }
    }
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  return (
    <Card className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 rounded-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-neutral-200">
          <ListBullets className="h-5 w-5" />
          <span>Batch Processing</span>
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Process multiple images at once by extracting or stripping metadata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Operation and File Selection */}
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-neutral-400 mb-2">
              Select Operation
            </Label>
            <Select
              value={operation}
              onValueChange={setOperation}
              disabled={isProcessing}
            >
              <SelectTrigger className="w-full lg:w-1/2 bg-neutral-800 border-neutral-700 text-neutral-200">
                <SelectValue placeholder="Select an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extract">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Extract Comprehensive Metadata
                  </div>
                </SelectItem>
                <SelectItem value="strip">
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 mr-2" />
                    Strip All Metadata
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
              className="hidden"
              id="batch-upload"
              disabled={isProcessing}
            />
            <Label
              htmlFor="batch-upload"
              className={`block border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-600 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="space-y-2">
                <Upload className="mx-auto h-10 w-10 text-neutral-500" />
                <div className="font-medium text-neutral-300">
                  Click to select files or drag and drop
                </div>
                <div className="text-xs text-neutral-500">
                  JPG, PNG, WEBP, TIFF, etc. up to 10MB each
                </div>
              </div>
            </Label>
          </div>
        </div>

        {/* Section 2: File List and Process Button */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-neutral-300">
                Selected Files ({files.length}) - {formatFileSize(getTotalSize())}
              </h4>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  onClick={() => setFiles([])}
                  className="text-neutral-400 hover:text-white px-2"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto p-1 rounded-md bg-neutral-900 border border-neutral-800">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-md"
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-neutral-200 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="text-neutral-500 hover:text-white h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={processBatch}
              disabled={isProcessing}
              className="w-full py-4"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Spinner className="h-4 w-4 animate-spin mr-2" />
                  Processing {files.length} files...
                </div>
              ) : (
                <>
                  {operation === 'extract'
                    ? 'Extract Metadata from'
                    : 'Strip Metadata from'}{' '}
                  {files.length} files
                  <ArrowLineRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Section 3: Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium text-neutral-300">
                  Processing Results
                </h4>
                <div className="text-sm text-neutral-400">
                  {results.summary.successful} successful, {results.summary.failed}{' '}
                  failed
                </div>
              </div>
              <Button onClick={downloadResults} variant="outline">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Download {operation === 'extract' ? 'Results' : 'Files'}
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto p-1 rounded-md bg-neutral-900 border border-neutral-800">
              {results.results.map((result, index) => (
                <div key={index} className="p-3 rounded-md bg-neutral-800/50">
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle
                        className="h-5 w-5 mr-3 text-green-500 flex-shrink-0"
                        weight="bold"
                      />
                    ) : (
                      <XCircle
                        className="h-5 w-5 mr-3 text-red-500 flex-shrink-0"
                        weight="bold"
                      />
                    )}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-neutral-200 truncate">
                        {result.filename}
                      </div>
                      {result.success ? (
                        <div className="text-xs text-green-400">
                          {operation === 'extract' ? (
                            <>
                              Metadata extracted -{' '}
                              {
                                Object.keys(result.metadata?.embedded || {})
                                  .length
                              }{' '}
                              properties
                            </>
                          ) : (
                            <>
                              Metadata stripped - Reduced by{' '}
                              {formatFileSize(result.sizeDifference)} (
                              {result.percentageReduced}%)
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-red-400">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
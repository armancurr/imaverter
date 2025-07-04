'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Scissors,
  PencilSimple,
  ListBullets,
  Database,
  Info,
  FileImage,
  Spinner,
  ArrowLineRight,
  UploadSimple,
  ImageSquare,
  ArrowUUpLeft,
} from '@phosphor-icons/react';
import MetadataViewer from './metadata-viewer';
import MetadataForm from './metadata-form';
import BatchProcessor from './batch-processor';
import { extractBasicMetadata } from '@/lib/metadata/fallback-extractor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import useFileStore from '@/stores/use-file-store';
import Image from 'next/image';

export default function MetadataEditor() {
  // Core logic state
  const [metadata, setMetadata] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [processingStatus, setProcessingStatus] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState('upload'); // 'upload' or 'edit'
  const [dragActive, setDragActive] = useState(false);
  const newUploadInputRef = useRef(null);

  // Zustand store for file management
  const { file, preview, handleFileSelection, clearFile } = useFileStore();

  const handleFileChange = (selectedFile) => {
    handleClearResult();
    const result = handleFileSelection(selectedFile);
    if (!result.success && result.error) {
      toast.error(result.error, {
        action: { label: 'Close', onClick: () => toast.dismiss() },
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

  const handleNewUpload = () => {
    newUploadInputRef.current?.click();
  };

  const extractMetadata = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    setIsProcessing(true);
    setProcessingStatus('Preparing file...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      setProcessingStatus(
        'Extracting metadata (this may take a few seconds)...'
      );
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const response = await fetch('/api/metadata/dump', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      const result = await response.json();
      if (result.success) {
        setMetadata(result.metadata);
        setProcessingStatus('Metadata extracted successfully!');
        toast.success('Metadata extracted successfully!');
      } else {
        throw new Error(result.error || 'Failed to extract metadata');
      }
    } catch (error) {
      console.error('Error extracting metadata:', error);
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        setProcessingStatus('Extraction timed out. Trying fallback method...');
        try {
          const basicMetadata = await extractBasicMetadata(file);
          setMetadata(basicMetadata);
          setProcessingStatus(
            'Basic metadata extracted using fallback method.'
          );
          toast.success('Basic metadata extracted using fallback method.');
        } catch (fallbackError) {
          console.error('Fallback extraction failed:', fallbackError);
          toast.error(
            'Both primary and fallback metadata extraction failed. The file may be corrupted.'
          );
          setProcessingStatus('');
        }
      } else {
        toast.error(error.message || 'Failed to extract metadata');
        setProcessingStatus('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const stripMetadata = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    setIsProcessing(true);
    setProcessingStatus('Stripping metadata...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/metadata/strip', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stripped_${file.name}`;
        link.click();
        URL.revokeObjectURL(url);
        setProcessingStatus('Metadata stripped and file downloaded!');
        toast.success('Metadata stripped and file downloaded!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to strip metadata');
      }
    } catch (error) {
      console.error('Error stripping metadata:', error);
      if (error.name === 'AbortError') {
        toast.error('Strip operation timed out. Please try with a smaller file.');
      } else {
        toast.error(error.message || 'Failed to strip metadata');
      }
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMetadataEdit = async (editedFields) => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    setIsProcessing(true);
    setProcessingStatus('Applying metadata changes...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', JSON.stringify(editedFields));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/metadata/edit', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edited_${file.name}`;
        link.click();
        URL.revokeObjectURL(url);
        setProcessingStatus('Metadata edited and file downloaded!');
        toast.success('Metadata edited and file downloaded!');
        setViewMode('upload');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit metadata');
      }
    } catch (error) {
      console.error('Error editing metadata:', error);
      if (error.name === 'AbortError') {
        toast.error('Edit operation timed out. Please try with a smaller file.');
      } else {
        toast.error(error.message || 'Failed to edit metadata');
      }
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResult = () => {
    setMetadata(null);
    setProcessingStatus('');
    setViewMode('upload');
  };

  useEffect(() => {
    if (file) {
      handleClearResult();
    }
  }, [file]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="flex-shrink-0 relative">
        {/* View Toggle with Tooltips - Top Right */}
        <div className="absolute top-0 right-0 z-10">
          <TooltipProvider>
            <div className="flex items-center space-x-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTab('single')}
                    className={`rounded-md ${
                      activeTab === 'single'
                        ? 'bg-neutral-700 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Single File</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTab('batch')}
                    className={`rounded-md ${
                      activeTab === 'batch'
                        ? 'bg-neutral-700 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <ListBullets className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Batch Processing</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto min-h-0 mt-8">
        {activeTab === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* --- Left Column Card --- */}
            <Card className="h-full flex flex-col border shadow-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 overflow-hidden rounded-xl">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="flex items-center space-x-2 text-neutral-200">
                  {viewMode === 'upload' ? (
                    <Database className="h-5 w-5" />
                  ) : (
                    <PencilSimple className="h-5 w-5" />
                  )}
                  <span>
                    {viewMode === 'upload' ? 'Extract Metadata' : 'Edit Metadata'}
                  </span>
                </CardTitle>
                <CardDescription className="text-neutral-400">
                  {viewMode === 'upload'
                    ? 'Upload an image to extract and view its metadata'
                    : 'Modify the metadata fields and download the new image.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-6 min-h-0">
                {viewMode === 'upload' ? (
                  // --- UPLOAD VIEW ---
                  <>
                    <div className="flex-1 flex flex-col min-h-0 space-y-4">
                      <div
                        className={`flex-1 min-h-[280px] rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 flex items-center justify-center border-neutral-600 ${
                          dragActive
                            ? 'shadow-lg scale-[1.02]'
                            : 'hover:shadow-md'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="metadata-upload-input"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                        />
                        <Label
                          htmlFor="metadata-upload-input"
                          className="block cursor-pointer w-full h-full flex items-center justify-center"
                        >
                          {preview ? (
                            <Image
                              src={preview}
                              alt="Preview"
                              className="mx-auto rounded-md object-contain max-h-full max-w-full"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <div className="space-y-2">
                              <FileImage className="mx-auto h-10 w-10 text-neutral-400" />
                              <div>
                                <p className="font-medium text-md text-neutral-200">
                                  Click to upload or drag and drop
                                </p>
                                <p className="mt-2 text-xs text-neutral-400">
                                  PNG, JPG, WEBP up to 10MB
                                </p>
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                      {processingStatus && (
                        <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <Info className="h-4 w-4 text-neutral-400" />
                            <div className="text-sm text-neutral-200">
                              {processingStatus}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 mt-auto border-t border-neutral-800 flex-shrink-0">
                      <Button
                        onClick={extractMetadata}
                        disabled={!file || isProcessing}
                        className="flex-1 py-4"
                        size="lg"
                        style={{
                          backgroundColor: '#161616',
                          color: '#fff',
                          border: 'none',
                        }}
                      >
                        {isProcessing &&
                        processingStatus.includes('Extracting') ? (
                          <Spinner className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Extract Metadata
                            <ArrowLineRight
                              weight="bold"
                              className="ml-1 h-5 w-5"
                            />
                          </>
                        )}
                      </Button>
                      {file && (
                        <>
                          <Input
                            ref={newUploadInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(e.target.files[0])
                            }
                          />
                          <Button
                            onClick={handleNewUpload}
                            disabled={isProcessing}
                            className="py-4"
                            size="lg"
                            variant="outline"
                            style={{
                              backgroundColor: '#161616',
                              color: '#fff',
                              border: 'none',
                            }}
                          >
                            <UploadSimple className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  // --- EDIT VIEW ---
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto pr-2">
                      <MetadataForm
                        metadata={metadata}
                        onSave={handleMetadataEdit}
                        isProcessing={isProcessing}
                      />
                    </div>
                    <div className="pt-4 mt-4 border-t border-neutral-800 flex-shrink-0">
                      <Button
                        onClick={() => setViewMode('upload')}
                        variant="outline"
                        className="w-full"
                        disabled={isProcessing}
                        style={{
                          backgroundColor: '#161616',
                          color: '#fff',
                          border: 'none',
                        }}
                      >
                        <ArrowUUpLeft className="h-4 w-4 mr-2" />
                        Back to Upload
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* --- Right Column: Result Viewer --- */}
            <Card className="h-full flex flex-col border shadow-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 overflow-hidden rounded-xl">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="flex items-center space-x-2 text-neutral-100">
                  <Database className="h-5 w-5" />
                  <span>Metadata Result</span>
                </CardTitle>
                <CardDescription className="text-sm text-neutral-400">
                  {metadata
                    ? 'Metadata extracted successfully'
                    : 'Extracted metadata will appear here'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-6 min-h-0">
                <div className="flex-1 min-h-0">
                  {metadata ? (
                    <div className="h-full overflow-y-auto">
                      <MetadataViewer
                        metadata={metadata}
                        filename={file?.name}
                        isProcessing={isProcessing}
                        onEditClick={() => setViewMode('edit')}
                        onStripClick={stripMetadata}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 text-center flex flex-col items-center justify-center h-full">
                      <ImageSquare className="mx-auto h-10 w-10 text-neutral-500" />
                      <div>
                        <p className="font-medium text-md text-neutral-200">
                          No metadata extracted yet
                        </p>
                        <p className="mt-2 text-xs text-neutral-400">
                          Upload and extract metadata to see it here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <BatchProcessor />
        )}
      </div>
    </div>
  );
}
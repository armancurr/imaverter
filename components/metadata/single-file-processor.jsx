'use client';

import { useState } from 'react';
import { validateImageFile } from '@/lib/metadata/metadata-utils';
import { extractClientFileMetadata, getCurrentUserInfo } from '@/lib/metadata/client-extractor';
import MetadataViewer from './metadata-viewer';

export default function SingleFileProcessor() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      validateImageFile(selectedFile);
      setFile(selectedFile);
      setMetadata(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      setFile(null);
      setMetadata(null);
    }
  };

  const extractMetadata = async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    try {
      // Extract client-side file metadata first
      const clientMetadata = await extractClientFileMetadata(file);
      const userInfo = getCurrentUserInfo();
      
      // Combine client metadata with user info
      const combinedClientData = {
        ...clientMetadata,
        ...userInfo,
        extractedAt: new Date().toISOString()
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientMetadata', JSON.stringify(combinedClientData));

      const response = await fetch('/api/metadata/dump', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setMetadata(result.metadata);
      } else {
        setError(result.error || 'Failed to extract metadata');
      }
    } catch (error) {
      console.error('Metadata extraction error:', error);
      setError('Failed to extract metadata: ' + error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const stripMetadata = async () => {
    if (!file) return;

    setIsStripping(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/metadata/strip', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stripped_${file.name}`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to strip metadata');
      }
    } catch (error) {
      console.error('Metadata strip error:', error);
      setError('Failed to strip metadata: ' + error.message);
    } finally {
      setIsStripping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Extract Metadata</h3>
          <p className="text-gray-600 text-sm mb-4">
            Upload an image to extract and view its comprehensive metadata including file system properties and EXIF data
          </p>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
              >
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-gray-600">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </div>
                <div className="text-xs text-gray-500">
                  Modified: {new Date(file.lastModified).toLocaleString()}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            <button
              onClick={extractMetadata}
              disabled={!file || isExtracting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Extracting Metadata...
                </div>
              ) : (
                'Extract Comprehensive Metadata'
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h4 className="text-md font-medium mb-4">Quick Actions</h4>
          
          <button
            onClick={stripMetadata}
            disabled={!file || isStripping}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStripping ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Stripping Metadata...
              </div>
            ) : (
              'Strip All Metadata'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Metadata Result</h3>
        <p className="text-gray-600 text-sm mb-4">
          Extracted metadata will appear here
        </p>
        
        <MetadataViewer metadata={metadata} filename={file?.name} />
      </div>
    </div>
  );
}
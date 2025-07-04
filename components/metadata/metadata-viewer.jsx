'use client';

import { useState } from 'react';
import {
  Copy,
  DownloadSimple,
  FileText,
  Database,
  ListBullets,
  PencilSimple,
  Scissors,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MetadataViewer({
  metadata,
  filename,
  isProcessing,
  onEditClick,
  onStripClick,
}) {
  const [view, setView] = useState('formatted');

  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-4">
        <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-neutral-500" />
        </div>
        <span className="text-neutral-200">No metadata extracted yet</span>
        <span className="text-xs mt-1 text-neutral-400">
          Upload and extract an image to see metadata here
        </span>
      </div>
    );
  }

  const formatComprehensiveMetadata = (data) => {
    const formatted = {
      'File System Properties': {},
      'Owner & Permissions': {},
      'Date & Time Information': {},
      'Image Properties': {},
      'Camera & EXIF Data': {},
      'Technical Details': {},
      'Computed Information': {},
      'Other Metadata': {},
    };

    if (data.fileSystem) {
      const fs = data.fileSystem;
      formatted['File System Properties'] = {
        'File Name': fs.fileName || 'N/A',
        'File Extension': fs.fileExtension || 'N/A',
        'File Size': fs.sizeFormatted || 'N/A',
        'File Size (Bytes)': fs.size?.toLocaleString() || 'N/A',
        Directory: fs.directory || 'N/A',
        'Full Path': fs.fullPath || 'N/A',
        'File Type': fs.isFile ? 'File' : 'Directory',
        'Device ID': fs.device || 'N/A',
        Inode: fs.inode || 'N/A',
        'Hard Links': fs.links || 'N/A',
      };
      formatted['Owner & Permissions'] = {
        Owner: fs.owner || 'Unknown',
        Permissions: fs.permissions || 'N/A',
        'Permissions (Octal)': fs.permissionsOctal || 'N/A',
        'User ID': fs.uid || 'N/A',
        'Group ID': fs.gid || 'N/A',
      };
      formatted['Date & Time Information'] = {
        'Created Date': fs.createdDateFormatted || 'N/A',
        'Modified Date': fs.modifiedDateFormatted || 'N/A',
        'Accessed Date': fs.accessedDateFormatted || 'N/A',
        'Changed Date': fs.changedDateFormatted || 'N/A',
      };
    }

    if (data.embedded && typeof data.embedded === 'object') {
      Object.entries(data.embedded).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const lowerKey = key.toLowerCase();
        let formattedValue = value;
        if (lowerKey.includes('date') || lowerKey.includes('time')) {
          try {
            formattedValue = new Date(value).toLocaleString();
          } catch {
            formattedValue = String(value);
          }
        } else if (typeof value === 'object') {
          formattedValue = JSON.stringify(value, null, 2);
        } else {
          formattedValue = String(value);
        }
        if (
          lowerKey.includes('width') ||
          lowerKey.includes('height') ||
          lowerKey.includes('resolution') ||
          lowerKey.includes('pixel') ||
          lowerKey.includes('color') ||
          lowerKey.includes('image') ||
          lowerKey.includes('orientation') ||
          lowerKey.includes('depth')
        ) {
          formatted['Image Properties'][key] = formattedValue;
        } else if (
          lowerKey.includes('camera') ||
          lowerKey.includes('make') ||
          lowerKey.includes('model') ||
          lowerKey.includes('lens') ||
          lowerKey.includes('focal') ||
          lowerKey.includes('aperture') ||
          lowerKey.includes('iso') ||
          lowerKey.includes('shutter') ||
          lowerKey.includes('flash') ||
          lowerKey.includes('exposure') ||
          lowerKey.includes('fnumber') ||
          lowerKey.includes('speed')
        ) {
          formatted['Camera & EXIF Data'][key] = formattedValue;
        } else if (
          lowerKey.includes('format') ||
          lowerKey.includes('compression') ||
          lowerKey.includes('bit') ||
          lowerKey.includes('encoding') ||
          lowerKey.includes('profile') ||
          lowerKey.includes('type') ||
          lowerKey.includes('version') ||
          lowerKey.includes('software')
        ) {
          formatted['Technical Details'][key] = formattedValue;
        } else {
          formatted['Other Metadata'][key] = formattedValue;
        }
      });
    }

    if (data.computed && typeof data.computed === 'object') {
      const comp = data.computed;
      formatted['Computed Information'] = {
        'File Age (Days)': comp.fileAge !== undefined ? comp.fileAge : 'N/A',
        'Days Since Modified':
          comp.daysSinceModified !== undefined ? comp.daysSinceModified : 'N/A',
        'Is Image File': comp.isImage ? 'Yes' : 'No',
        'Has EXIF Data': comp.hasEXIF ? 'Yes' : 'No',
        'Total Metadata Properties': comp.metadataCount || 0,
      };
      if (comp.aspectRatio) {
        formatted['Computed Information']['Aspect Ratio'] = comp.aspectRatio;
      }
      if (comp.megapixels) {
        formatted['Computed Information']['Megapixels'] = comp.megapixels + ' MP';
      }
    }

    if (!data.fileSystem && !data.embedded && !data.computed) {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        const lowerKey = key.toLowerCase();
        let formattedValue = value;
        if (lowerKey.includes('date') || lowerKey.includes('time')) {
          try {
            formattedValue = new Date(value).toLocaleString();
          } catch {
            formattedValue = String(value);
          }
        } else if (typeof value === 'object') {
          formattedValue = JSON.stringify(value, null, 2);
        } else {
          formattedValue = String(value);
        }
        if (
          lowerKey.includes('file') ||
          lowerKey.includes('size') ||
          lowerKey.includes('created') ||
          lowerKey.includes('modified')
        ) {
          formatted['File System Properties'][key] = formattedValue;
        } else if (
          lowerKey.includes('width') ||
          lowerKey.includes('height') ||
          lowerKey.includes('resolution') ||
          lowerKey.includes('pixel')
        ) {
          formatted['Image Properties'][key] = formattedValue;
        } else if (
          lowerKey.includes('camera') ||
          lowerKey.includes('make') ||
          lowerKey.includes('model') ||
          lowerKey.includes('iso')
        ) {
          formatted['Camera & EXIF Data'][key] = formattedValue;
        } else {
          formatted['Other Metadata'][key] = formattedValue;
        }
      });
    }

    Object.keys(formatted).forEach((category) => {
      if (Object.keys(formatted[category]).length === 0) {
        delete formatted[category];
      }
    });

    return formatted;
  };

  const formattedMetadata = formatComprehensiveMetadata(metadata);

  const downloadMetadata = () => {
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'metadata'}_metadata.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Metadata JSON downloaded successfully!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const getSummaryStats = () => {
    const totalCategories = Object.keys(formattedMetadata).length;
    const totalProperties = Object.values(formattedMetadata).reduce(
      (sum, category) => sum + Object.keys(category).length,
      0
    );
    const fileSize = metadata.fileSystem?.sizeFormatted || 'N/A';
    const owner = metadata.fileSystem?.owner || 'N/A';

    return { totalCategories, totalProperties, fileSize, owner };
  };

  const stats = getSummaryStats();

  // Custom style for white-background buttons (now #161616)
  const whiteToDarkButtonClass =
    'bg-[#161616] text-white border-none';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {filename && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex-shrink-0 mb-4">
          <h3 className="font-semibold text-neutral-200 mb-2 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            {filename}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-neutral-400 font-medium">Categories</div>
              <div className="text-neutral-200">{stats.totalCategories}</div>
            </div>
            <div>
              <div className="text-neutral-400 font-medium">Properties</div>
              <div className="text-neutral-200">{stats.totalProperties}</div>
            </div>
            <div>
              <div className="text-neutral-400 font-medium">File Size</div>
              <div className="text-neutral-200">{stats.fileSize}</div>
            </div>
            <div>
              <div className="text-neutral-400 font-medium">Owner</div>
              <div className="text-neutral-200">{stats.owner}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 flex-shrink-0 mb-4">
        <Button
          onClick={() => setView('formatted')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            view === 'formatted'
              ? 'bg-neutral-700 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          <ListBullets className="h-4 w-4 mr-2" />
          Formatted View
        </Button>
        <Button
          onClick={() => setView('raw')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            view === 'raw'
              ? 'bg-neutral-700 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Raw JSON
        </Button>
      </div>

      <div className="flex-1 border border-neutral-700 rounded-lg bg-neutral-900 overflow-hidden mb-4 min-h-0">
        {view === 'formatted' ? (
          <div className="h-full overflow-y-auto">
            {Object.entries(formattedMetadata).map(([category, properties]) => (
              <div
                key={category}
                className="border-b border-neutral-800 last:border-b-0"
              >
                <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700 sticky top-0 z-10">
                  <h4 className="text-sm font-semibold text-neutral-200 flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-xs text-neutral-400 font-normal">
                      {Object.keys(properties).length} properties
                    </span>
                  </h4>
                </div>
                <div className="divide-y divide-neutral-800">
                  {Object.entries(properties).map(([key, value]) => (
                    <div
                      key={key}
                      className="px-4 py-3 hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <dt className="text-sm font-medium text-neutral-400 min-w-0 flex-1">
                          {key}
                        </dt>
                        <dd className="text-sm text-neutral-200 text-right break-words min-w-0 flex-1">
                          {String(value)}
                        </dd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full bg-neutral-950 relative overflow-hidden">
            <button
              onClick={() =>
                copyToClipboard(JSON.stringify(metadata, null, 2))
              }
              className="absolute top-2 right-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1 rounded text-xs transition-colors z-10"
            >
              <Copy className="h-3 w-3 mr-1 inline" />
              Copy JSON
            </button>
            <div className="h-full overflow-y-auto p-4">
              <pre className="text-neutral-300 text-xs whitespace-pre-wrap break-words pt-8">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2 flex-shrink-0">
        <Button
          onClick={onEditClick}
          disabled={isProcessing}
          variant="outline"
          className={`flex-1 ${whiteToDarkButtonClass} hover:bg-[#161616] hover:text-white`}
        >
          <PencilSimple className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={onStripClick}
          disabled={isProcessing}
          variant="outline"
          className={`flex-1 ${whiteToDarkButtonClass} hover:bg-[#161616] hover:text-white`}
        >
          <Scissors className="h-4 w-4 mr-2" />
          Strip
        </Button>
        <Button
          onClick={downloadMetadata}
          disabled={isProcessing}
          className="flex-1"
        >
          <DownloadSimple className="h-4 w-4 mr-2" />
          Download JSON
        </Button>
      </div>
    </div>
  );
}
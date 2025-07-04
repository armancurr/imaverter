import { NextResponse } from 'next/server';
import { exiftoolManager } from '@/lib/metadata/exiftool';
import { validateImageFile } from '@/lib/metadata/metadata-utils';
import { writeFile, unlink, utimes } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Add timeout wrapper
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export async function POST(request) {
  let tempFilePath = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const clientMetadata = formData.get('clientMetadata');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Processing file for comprehensive metadata:', file.name, 'Size:', file.size);

    // Validate file
    try {
      validateImageFile(file);
    } catch (validationError) {
      return NextResponse.json({ 
        error: `File validation failed: ${validationError.message}` 
      }, { status: 400 });
    }

    // Parse client-side metadata (original file system data)
    let originalFileData = {};
    if (clientMetadata) {
      try {
        originalFileData = JSON.parse(clientMetadata);
      } catch (e) {
        console.warn('Failed to parse client metadata:', e);
      }
    }

    // Create temporary file
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFileName = `metadata_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
    tempFilePath = join(tmpdir(), tempFileName);
    
    console.log('Created temp file:', tempFilePath);
    
    // Write buffer to temporary file
    await writeFile(tempFilePath, buffer);
    
    // Try to preserve original file timestamp if available
    if (originalFileData.lastModified) {
      try {
        const originalDate = new Date(originalFileData.lastModified);
        await utimes(tempFilePath, originalDate, originalDate);
        console.log('Preserved original file timestamp');
      } catch (e) {
        console.warn('Could not preserve original timestamp:', e);
      }
    }
    
    console.log('File written to temp location');
    
    // Extract EXIF metadata with timeout (30 seconds max)
    console.log('Extracting EXIF metadata...');
    const exifMetadata = await withTimeout(
      exiftoolManager.readMetadata(tempFilePath),
      30000 // 30 second timeout
    );
    console.log('EXIF metadata extracted successfully');
    
    // Combine original file system data with EXIF data
    const comprehensiveMetadata = {
      fileSystem: formatFileSystemData(originalFileData, file),
      embedded: exifMetadata,
      computed: computeAdditionalProperties(originalFileData, file, exifMetadata)
    };
    
    // Format metadata for better display
    const formattedMetadata = formatMetadataForDisplay(comprehensiveMetadata);
    
    return NextResponse.json({ 
      success: true,
      metadata: formattedMetadata,
      raw: comprehensiveMetadata, // Include raw data for debugging
      filename: file.name,
      size: file.size,
      extractionType: 'comprehensive'
    });
    
  } catch (error) {
    console.error('Comprehensive metadata dump error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to extract comprehensive metadata';
    if (error.message.includes('timed out')) {
      errorMessage = 'Metadata extraction timed out. The file may be corrupted or too complex.';
    } else if (error.message.includes('File format error')) {
      errorMessage = 'Unsupported file format or corrupted file.';
    } else if (error.message.includes('ENOENT')) {
      errorMessage = 'ExifTool not found. Please check installation.';
    } else if (error.message.includes('spawn')) {
      errorMessage = 'ExifTool failed to start. Please check your system configuration.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('Temp file cleaned up:', tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}

// Format file system data from client-side information
function formatFileSystemData(clientData, file) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return {
    fileName: file.name,
    fileExtension: file.name.split('.').pop() || '',
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    
    // Use original file dates if available
    lastModified: file.lastModified,
    lastModifiedFormatted: formatDate(file.lastModified),
    
    // Client-side extracted data
    owner: clientData.owner || 'Not Available (Web Upload)',
    permissions: clientData.permissions || 'N/A',
    createdDate: clientData.created || 'N/A',
    createdDateFormatted: clientData.created ? formatDate(clientData.created) : 'N/A',
    accessedDate: clientData.accessed || 'N/A',
    accessedDateFormatted: clientData.accessed ? formatDate(clientData.accessed) : 'N/A',
    
    // Additional file info
    webkitRelativePath: clientData.webkitRelativePath || '',
    isFile: true,
    isDirectory: false
  };
}

// Compute additional properties
function computeAdditionalProperties(clientData, file, exifMetadata) {
  const computed = {};
  
  // File age calculations
  const now = new Date();
  const lastModified = new Date(file.lastModified);
  
  computed.fileAge = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));
  computed.daysSinceModified = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));
  
  // Image specific computations
  if (exifMetadata.ImageWidth && exifMetadata.ImageHeight) {
    computed.aspectRatio = (exifMetadata.ImageWidth / exifMetadata.ImageHeight).toFixed(3);
    computed.megapixels = ((exifMetadata.ImageWidth * exifMetadata.ImageHeight) / 1000000).toFixed(2);
  }
  
  // File type analysis
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'];
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  computed.isImage = imageExtensions.includes(extension);
  computed.hasEXIF = Object.keys(exifMetadata).length > 0;
  computed.metadataCount = Object.keys(exifMetadata).length;
  
  return computed;
}

// Enhanced metadata formatting function
function formatMetadataForDisplay(comprehensiveMetadata) {
  const formatted = {
    fileSystem: {},
    embedded: {},
    computed: {},
    summary: {}
  };

  // Format file system metadata
  if (comprehensiveMetadata.fileSystem) {
    const fs = comprehensiveMetadata.fileSystem;
    formatted.fileSystem = {
      'File Name': fs.fileName,
      'File Extension': fs.fileExtension,
      'File Size': fs.sizeFormatted,
      'File Size (Bytes)': fs.size?.toLocaleString(),
      'File Type': fs.type,
      'Last Modified': fs.lastModifiedFormatted,
      'Created Date': fs.createdDateFormatted,
      'Accessed Date': fs.accessedDateFormatted,
      'Owner': fs.owner,
      'Permissions': fs.permissions,
      'Web Path': fs.webkitRelativePath || 'N/A'
    };
  }

  // Format embedded metadata (EXIF, etc.)
  if (comprehensiveMetadata.embedded) {
    Object.entries(comprehensiveMetadata.embedded).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Format dates
        if (key.includes('Date') || key.includes('Time')) {
          try {
            formatted.embedded[key] = new Date(value).toLocaleString();
          } catch {
            formatted.embedded[key] = value;
          }
        } else if (typeof value === 'object' && value !== null) {
          formatted.embedded[key] = JSON.stringify(value, null, 2);
        } else {
          formatted.embedded[key] = String(value);
        }
      }
    });
  }

  // Format computed metadata
  if (comprehensiveMetadata.computed) {
    const comp = comprehensiveMetadata.computed;
    formatted.computed = {
      'File Age (Days)': comp.fileAge,
      'Days Since Modified': comp.daysSinceModified,
      'Is Image File': comp.isImage ? 'Yes' : 'No',
      'Has EXIF Data': comp.hasEXIF ? 'Yes' : 'No',
      'Total EXIF Properties': comp.metadataCount || 0
    };

    if (comp.aspectRatio) {
      formatted.computed['Aspect Ratio'] = comp.aspectRatio;
    }
    if (comp.megapixels) {
      formatted.computed['Megapixels'] = comp.megapixels + ' MP';
    }
  }

  // Create summary
  formatted.summary = {
    'Total Properties': Object.keys(formatted.fileSystem).length + 
                       Object.keys(formatted.embedded).length + 
                       Object.keys(formatted.computed).length,
    'File System Properties': Object.keys(formatted.fileSystem).length,
    'Embedded Properties': Object.keys(formatted.embedded).length,
    'Computed Properties': Object.keys(formatted.computed).length
  };

  return formatted;
}
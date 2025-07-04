// Fallback metadata extractor using piexifjs for client-side processing
export const extractBasicMetadata = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Basic file information
        const basicInfo = {
          filename: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified).toISOString(),
        };

        // Try to extract image dimensions
        const img = new Image();
        img.onload = () => {
          basicInfo.width = img.width;
          basicInfo.height = img.height;
          basicInfo.aspectRatio = (img.width / img.height).toFixed(2);
          resolve(basicInfo);
        };
        img.onerror = () => {
          resolve(basicInfo);
        };
        img.src = e.target.result;
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Format file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateImageFile = (file) => {
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/tiff',
    'image/tif',
    'image/bmp',
    'image/gif'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type) {
    throw new Error('File type could not be determined');
  }

  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Invalid file type: ${file.type}. Supported: JPG, PNG, WEBP, TIFF, BMP, GIF`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size too large: ${formatFileSize(file.size)}. Maximum: ${formatFileSize(maxSize)}`);
  }

  if (file.size === 0) {
    throw new Error('File appears to be empty');
  }

  return true;
};

export const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  // Remove potentially sensitive metadata
  const sensitiveKeys = [
    'GPS', 'Location', 'GPS*', 'Geolocation*',
    'Creator*', 'Artist', 'Copyright', 'UserComment',
    'SerialNumber', 'InternalSerialNumber'
  ];

  const sanitized = { ...metadata };
  
  sensitiveKeys.forEach(key => {
    if (key.includes('*')) {
      const prefix = key.replace('*', '');
      Object.keys(sanitized).forEach(metaKey => {
        if (metaKey.startsWith(prefix)) {
          delete sanitized[metaKey];
        }
      });
    } else {
      delete sanitized[key];
    }
  });

  return sanitized;
};

export const formatMetadataForDisplay = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const formatted = {};
  
  Object.entries(metadata).forEach(([key, value]) => {
    // Skip empty or null values
    if (value === null || value === undefined || value === '') return;
    
    try {
      // Format common metadata fields
      if (key.includes('Date') || key.includes('Time')) {
        try {
          formatted[key] = new Date(value).toLocaleString();
        } catch {
          formatted[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        formatted[key] = JSON.stringify(value, null, 2);
      } else {
        formatted[key] = String(value);
      }
    } catch (error) {
      // If formatting fails, use original value
      formatted[key] = String(value);
    }
  });

  return formatted;
};

export const sanitizeFileName = (filename) => {
  if (!filename) return 'unknown';
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Client-side metadata utilities using piexifjs
export const loadPiexif = async () => {
  if (typeof window !== 'undefined') {
    const piexif = await import('piexifjs');
    return piexif.default || piexif;
  }
  return null;
};

export const extractMetadataClient = async (file) => {
  try {
    const piexif = await loadPiexif();
    if (!piexif) throw new Error('Piexif not available on server');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exifObj = piexif.load(e.target.result);
          resolve(exifObj);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
};

export const stripMetadataClient = async (file) => {
  try {
    const piexif = await loadPiexif();
    if (!piexif) throw new Error('Piexif not available on server');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const removed = piexif.remove(e.target.result);
          resolve(removed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    throw new Error(`Failed to strip metadata: ${error.message}`);
  }
};

// Enhanced metadata formatting for comprehensive display
export const formatComprehensiveMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const formatted = {
    'File System Properties': {},
    'Image Properties': {},
    'Camera Information': {},
    'Date & Time Information': {},
    'Technical Details': {},
    'Other Metadata': {}
  };

  // Categorize metadata
  Object.entries(metadata).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    
    const lowerKey = key.toLowerCase();
    let formattedValue = value;
    
    // Format dates
    if (lowerKey.includes('date') || lowerKey.includes('time')) {
      try {
        formattedValue = new Date(value).toLocaleString();
      } catch {
        formattedValue = value;
      }
    }
    
    // Categorize based on key patterns
    if (lowerKey.includes('file') || lowerKey.includes('size') || lowerKey.includes('created') || 
        lowerKey.includes('modified') || lowerKey.includes('accessed')) {
      formatted['File System Properties'][key] = formattedValue;
    } else if (lowerKey.includes('width') || lowerKey.includes('height') || lowerKey.includes('resolution') ||
               lowerKey.includes('pixel') || lowerKey.includes('color')) {
      formatted['Image Properties'][key] = formattedValue;
    } else if (lowerKey.includes('camera') || lowerKey.includes('make') || lowerKey.includes('model') ||
               lowerKey.includes('lens') || lowerKey.includes('focal') || lowerKey.includes('aperture') ||
               lowerKey.includes('iso') || lowerKey.includes('shutter') || lowerKey.includes('flash')) {
      formatted['Camera Information'][key] = formattedValue;
    } else if (lowerKey.includes('date') || lowerKey.includes('time')) {
      formatted['Date & Time Information'][key] = formattedValue;
    } else if (lowerKey.includes('format') || lowerKey.includes('compression') || lowerKey.includes('bit') ||
               lowerKey.includes('encoding') || lowerKey.includes('profile')) {
      formatted['Technical Details'][key] = formattedValue;
    } else {
      formatted['Other Metadata'][key] = formattedValue;
    }
  });

  // Remove empty categories
  Object.keys(formatted).forEach(category => {
    if (Object.keys(formatted[category]).length === 0) {
      delete formatted[category];
    }
  });

  return formatted;
};

// Utility to flatten nested metadata objects
export const flattenMetadata = (obj, prefix = '') => {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenMetadata(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
};

// Convert metadata object to CSV format
export const metadataToCSV = (metadataList) => {
  if (!Array.isArray(metadataList) || metadataList.length === 0) {
    return '';
  }

  // Get all unique keys from all metadata objects
  const allKeys = new Set();
  metadataList.forEach(metadata => {
    const flattened = flattenMetadata(metadata);
    Object.keys(flattened).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const csvRows = [headers.join(',')];

  // Convert each metadata object to CSV row
  metadataList.forEach(metadata => {
    const flattened = flattenMetadata(metadata);
    const row = headers.map(header => {
      const value = flattened[header];
      if (value === null || value === undefined) return '';
      
      // Escape CSV values that contain commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};
// Enhanced ExifTool wrapper with comprehensive metadata extraction including owner info
import { exiftool } from 'exiftool-vendored';
import { stat, access, constants } from 'fs/promises';
import { join, basename, extname, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ExifToolManager {
  constructor() {
    this.defaultOptions = {
      taskTimeoutMillis: 30000,
      maxProcs: 1,
      spawnTimeoutMillis: 15000,
    };
  }

  // Get Windows owner information
  async getOwnerInfo(filePath) {
    try {
      if (process.platform === 'win32') {
        // Windows command to get file owner
        const { stdout } = await execAsync(`powershell -Command "(Get-Acl '${filePath}').Owner"`);
        return stdout.trim();
      } else {
        // Unix/Linux command to get file owner
        const stats = await stat(filePath);
        try {
          const { stdout: userInfo } = await execAsync(`id -nu ${stats.uid} 2>/dev/null || echo "uid:${stats.uid}"`);
          const { stdout: groupInfo } = await execAsync(`id -ng ${stats.gid} 2>/dev/null || echo "gid:${stats.gid}"`);
          return `${userInfo.trim()}/${groupInfo.trim()}`;
        } catch {
          return `uid:${stats.uid}/gid:${stats.gid}`;
        }
      }
    } catch (error) {
      console.warn('Could not get owner info:', error.message);
      return 'Unknown';
    }
  }

  // Extract comprehensive metadata including file system properties and owner
  async readComprehensiveMetadata(filePath) {
    console.log('Starting comprehensive metadata extraction for:', filePath);
    
    try {
      // Get file system stats and owner info in parallel
      const [fileStats, ownerInfo] = await Promise.all([
        this.getFileSystemMetadata(filePath),
        this.getOwnerInfo(filePath)
      ]);
      
      // Add owner info to file stats
      fileStats.owner = ownerInfo;
      
      // Get EXIF/metadata using ExifTool with all available tags
      const exifMetadata = await exiftool.read(filePath, ['-all', '-G', '-a', '-s'], this.defaultOptions);
      
      // Combine all metadata
      const comprehensiveMetadata = {
        // File System Properties
        fileSystem: fileStats,
        
        // EXIF and other embedded metadata
        embedded: exifMetadata,
        
        // Additional computed properties
        computed: this.computeAdditionalProperties(fileStats, exifMetadata)
      };
      
      console.log('Comprehensive metadata extraction completed successfully');
      return comprehensiveMetadata;
    } catch (error) {
      console.error('Comprehensive metadata extraction error:', error);
      throw new Error(`Failed to read comprehensive metadata: ${error.message}`);
    }
  }

  // Extract detailed file system metadata
  async getFileSystemMetadata(filePath) {
    try {
      const stats = await stat(filePath);
      const fileName = basename(filePath);
      const fileExtension = extname(filePath);
      const directory = dirname(filePath);
      
      return {
        // Basic file information
        fileName: fileName,
        fileExtension: fileExtension,
        directory: directory,
        fullPath: filePath,
        
        // File size information
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        
        // Date information (comprehensive)
        createdDate: stats.birthtime || stats.ctime,
        modifiedDate: stats.mtime,
        accessedDate: stats.atime,
        changedDate: stats.ctime,
        
        // Formatted dates
        createdDateFormatted: this.formatDate(stats.birthtime || stats.ctime),
        modifiedDateFormatted: this.formatDate(stats.mtime),
        accessedDateFormatted: this.formatDate(stats.atime),
        changedDateFormatted: this.formatDate(stats.ctime),
        
        // File type and permissions
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mode: stats.mode,
        permissions: this.getPermissionsString(stats.mode),
        permissionsOctal: '0' + (stats.mode & parseInt('777', 8)).toString(8),
        
        // System information
        device: stats.dev,
        inode: stats.ino,
        links: stats.nlink,
        uid: stats.uid,
        gid: stats.gid,
        
        // Block information
        blocks: stats.blocks,
        blockSize: stats.blksize
      };
    } catch (error) {
      console.error('File system metadata extraction error:', error);
      throw new Error(`Failed to get file system metadata: ${error.message}`);
    }
  }

  // Compute additional properties
  computeAdditionalProperties(fileStats, exifMetadata) {
    const computed = {};
    
    // File age calculations
    const now = new Date();
    const created = new Date(fileStats.createdDate);
    const modified = new Date(fileStats.modifiedDate);
    
    computed.fileAge = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    computed.daysSinceModified = Math.floor((now - modified) / (1000 * 60 * 60 * 24));
    
    // Image specific computations
    if (exifMetadata.ImageWidth && exifMetadata.ImageHeight) {
      computed.aspectRatio = (exifMetadata.ImageWidth / exifMetadata.ImageHeight).toFixed(3);
      computed.megapixels = ((exifMetadata.ImageWidth * exifMetadata.ImageHeight) / 1000000).toFixed(2);
    }
    
    // File type analysis
    computed.isImage = this.isImageFile(fileStats.fileExtension);
    computed.hasEXIF = Object.keys(exifMetadata).length > 0;
    computed.metadataCount = Object.keys(exifMetadata).length;
    
    return computed;
  }

  // Format file size in human readable format
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format date in readable format
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Get permissions string
  getPermissionsString(mode) {
    const permissions = [];
    
    // Owner permissions
    permissions.push((mode & 0o400) ? 'r' : '-');
    permissions.push((mode & 0o200) ? 'w' : '-');
    permissions.push((mode & 0o100) ? 'x' : '-');
    
    // Group permissions
    permissions.push((mode & 0o040) ? 'r' : '-');
    permissions.push((mode & 0o020) ? 'w' : '-');
    permissions.push((mode & 0o010) ? 'x' : '-');
    
    // Other permissions
    permissions.push((mode & 0o004) ? 'r' : '-');
    permissions.push((mode & 0o002) ? 'w' : '-');
    permissions.push((mode & 0o001) ? 'x' : '-');
    
    return permissions.join('');
  }

  // Check if file is an image
  isImageFile(extension) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'];
    return imageExtensions.includes(extension.toLowerCase());
  }

  // Original methods for backward compatibility
  async readMetadata(filePath) {
    console.log('Starting metadata extraction for:', filePath);
    
    try {
      const metadata = await exiftool.read(filePath, undefined, this.defaultOptions);
      console.log('Metadata extraction completed successfully');
      return metadata;
    } catch (error) {
      console.error('ExifTool read error:', error);
      throw new Error(`Failed to read metadata: ${error.message}`);
    }
  }

  async writeMetadata(filePath, tags) {
    console.log('Starting metadata write for:', filePath);
    
    try {
      const result = await exiftool.write(filePath, tags, undefined, this.defaultOptions);
      console.log('Metadata write completed successfully');
      return result;
    } catch (error) {
      console.error('ExifTool write error:', error);
      throw new Error(`Failed to write metadata: ${error.message}`);
    }
  }

  async stripMetadata(filePath) {
    console.log('Starting metadata strip for:', filePath);
    
    try {
      const result = await exiftool.write(filePath, { all: '' }, ['-overwrite_original'], this.defaultOptions);
      console.log('Metadata strip completed successfully');
      return result;
    } catch (error) {
      console.error('ExifTool strip error:', error);
      throw new Error(`Failed to strip metadata: ${error.message}`);
    }
  }

  async shutdown() {
    console.log('Shutting down ExifTool...');
    try {
      await exiftool.end();
    } catch (error) {
      console.error('Error during ExifTool shutdown:', error);
    }
  }
}

// Create singleton instance
export const exiftoolManager = new ExifToolManager();

// Cleanup on process exit
process.on('exit', () => {
  exiftoolManager.shutdown();
});

process.on('SIGINT', () => {
  exiftoolManager.shutdown();
  process.exit();
});

process.on('SIGTERM', () => {
  exiftoolManager.shutdown();
  process.exit();
});
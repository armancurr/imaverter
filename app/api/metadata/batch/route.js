import { NextResponse } from 'next/server';
import { exiftoolManager } from '@/lib/metadata/exiftool';
import { validateImageFile } from '@/lib/metadata/metadata-utils';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Timeout wrapper
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export async function POST(request) {
  const tempFiles = [];
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const operation = formData.get('operation') || 'extract';
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(`Starting batch ${operation} for ${files.length} files`);

    const results = [];
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let tempFilePath = null;
      
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        
        // Validate file
        validateImageFile(file);
        
        // Create temporary file
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempFileName = `batch_${operation}_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        tempFilePath = join(tmpdir(), tempFileName);
        tempFiles.push(tempFilePath);
        
        // Write buffer to temporary file
        await writeFile(tempFilePath, buffer);
        
        let result = {
          filename: file.name,
          success: false,
          index: i
        };
        
        if (operation === 'extract') {
          // Extract comprehensive metadata
          const metadata = await withTimeout(
            exiftoolManager.readComprehensiveMetadata(tempFilePath),
            25000 // 25 second timeout per file
          );
          
          result.success = true;
          result.metadata = metadata;
          result.size = file.size;
          
        } else if (operation === 'strip') {
          // Strip metadata
          await withTimeout(
            exiftoolManager.stripMetadata(tempFilePath),
            15000 // 15 second timeout per file
          );
          
          // Read stripped file
          const strippedBuffer = await readFile(tempFilePath);
          const originalSize = file.size;
          const strippedSize = strippedBuffer.length;
          
          result.success = true;
          result.originalSize = originalSize;
          result.strippedSize = strippedSize;
          result.sizeDifference = originalSize - strippedSize;
          result.percentageReduced = ((originalSize - strippedSize) / originalSize * 100).toFixed(2);
          
          // Convert buffer to base64 for download
          result.processedFile = {
            data: strippedBuffer.toString('base64'),
            type: file.type,
            filename: `stripped_${file.name}`
          };
        }
        
        results.push(result);
        console.log(`Successfully processed: ${file.name}`);
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        results.push({
          filename: file.name,
          success: false,
          error: error.message,
          index: i
        });
      }
    }
    
    // Calculate summary
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    const summary = {
      total: files.length,
      successful: successCount,
      failed: failureCount,
      operation: operation,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Batch ${operation} completed:`, summary);
    
    return NextResponse.json({
      success: true,
      summary,
      results,
      operation
    });
    
  } catch (error) {
    console.error('Batch processing error:', error);
    
    return NextResponse.json({
      error: 'Batch processing failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    // Clean up all temporary files
    for (const tempFile of tempFiles) {
      try {
        await unlink(tempFile);
        console.log('Cleaned up temp file:', tempFile);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', tempFile, cleanupError);
      }
    }
  }
}
import { NextResponse } from 'next/server';
import { exiftoolManager } from '@/lib/metadata/exiftool';
import { validateImageFile } from '@/lib/metadata/metadata-utils';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request) {
  let tempFilePath = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Stripping metadata from file:', file.name);

    validateImageFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create temporary file
    const tempFileName = `strip_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    tempFilePath = join(tmpdir(), tempFileName);
    
    // Write buffer to temporary file
    await writeFile(tempFilePath, buffer);
    console.log('File written for stripping:', tempFilePath);
    
    // Strip metadata using file path
    await exiftoolManager.stripMetadata(tempFilePath);
    console.log('Metadata stripped successfully');
    
    // Read the stripped file back
    const strippedBuffer = await readFile(tempFilePath);
    
    return new NextResponse(strippedBuffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="stripped_${file.name}"`,
      },
    });
    
  } catch (error) {
    console.error('Metadata strip error:', error);
    
    let errorMessage = 'Failed to strip metadata';
    if (error.message.includes('BatchCluster has ended')) {
      errorMessage = 'ExifTool service temporarily unavailable. Please try again.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message
    }, { status: 500 });
    
  } finally {
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('Strip temp file cleaned up');
      } catch (cleanupError) {
        console.error('Failed to cleanup strip temp file:', cleanupError);
      }
    }
  }
}
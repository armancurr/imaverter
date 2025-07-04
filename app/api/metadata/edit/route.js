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
    const tagsJson = formData.get('tags');
    
    if (!file || !tagsJson) {
      return NextResponse.json({ 
        error: 'File and tags are required' 
      }, { status: 400 });
    }

    console.log('Editing metadata for file:', file.name);

    validateImageFile(file);

    const tags = JSON.parse(tagsJson);
    console.log('Tags to apply:', tags);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create temporary file
    const tempFileName = `edit_${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    tempFilePath = join(tmpdir(), tempFileName);
    
    // Write buffer to temporary file
    await writeFile(tempFilePath, buffer);
    console.log('File written for editing:', tempFilePath);
    
    // Edit metadata using file path
    await exiftoolManager.writeMetadata(tempFilePath, tags);
    console.log('Metadata edited successfully');
    
    // Read the modified file back
    const modifiedBuffer = await readFile(tempFilePath);
    
    return new NextResponse(modifiedBuffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="edited_${file.name}"`,
      },
    });
    
  } catch (error) {
    console.error('Metadata edit error:', error);
    
    let errorMessage = 'Failed to edit metadata';
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
        console.log('Edit temp file cleaned up');
      } catch (cleanupError) {
        console.error('Failed to cleanup edit temp file:', cleanupError);
      }
    }
  }
}
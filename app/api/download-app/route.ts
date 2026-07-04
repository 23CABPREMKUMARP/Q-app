import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const chunksDir = path.join(process.cwd(), 'public', 'apk-chunks');
  
  if (!fs.existsSync(chunksDir)) {
    return new NextResponse('APK not found', { status: 404 });
  }

  // Define the chunks in order
  const chunks = ['chunk_aa', 'chunk_ab', 'chunk_ac', 'chunk_ad', 'chunk_ae'];
  
  // Calculate total size for Content-Length
  let totalSize = 0;
  for (const chunk of chunks) {
    const chunkPath = path.join(chunksDir, chunk);
    if (fs.existsSync(chunkPath)) {
      totalSize += fs.statSync(chunkPath).size;
    }
  }

  // Create a readable stream that yields chunks sequentially
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const chunkPath = path.join(chunksDir, chunk);
        if (fs.existsSync(chunkPath)) {
          const buffer = fs.readFileSync(chunkPath);
          controller.enqueue(buffer);
        }
      }
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Disposition': 'attachment; filename="DigiBus-App.apk"',
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': totalSize.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

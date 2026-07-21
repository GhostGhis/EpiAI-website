import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 80 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * POST /api/upload/event-media
 * FormData: file + kind ("cover" | "gallery" | "video")
 */
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkUserPermission('dashboard.admin');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kind = String(formData.get('kind') || 'gallery');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = kind === 'video' || VIDEO_TYPES.includes(file.type);
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
    const max = isVideo ? MAX_VIDEO : MAX_IMAGE;

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Type "${file.type}" non autorisé pour ${isVideo ? 'une vidéo' : 'une image'}.` },
        { status: 400 }
      );
    }

    if (file.size > max) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Vidéo trop lourde (max 80 Mo).'
            : 'Image trop lourde (max 8 Mo).',
        },
        { status: 400 }
      );
    }

    const folder = isVideo ? 'videos' : 'images';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'events', folder);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || (isVideo ? '.mp4' : '.jpg');
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeName), buffer);

    const url = `/uploads/events/${folder}/${safeName}`;
    return NextResponse.json({
      url,
      kind: isVideo ? 'video' : kind === 'cover' ? 'cover' : 'gallery',
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Event media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

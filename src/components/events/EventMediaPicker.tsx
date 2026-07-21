'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Video, X, Loader2, Link2 } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/utils/image-url';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface EventMediaPickerProps {
  locale: string;
  imageUrl: string;
  gallery: string[];
  videoUrls: string[];
  onChange: (next: { imageUrl: string; gallery: string[]; videoUrls: string[] }) => void;
}

async function uploadFile(file: File, kind: 'cover' | 'gallery' | 'video'): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  body.append('kind', kind);
  const res = await fetch('/api/upload/event-media', { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

export function EventMediaPicker({
  locale,
  imageUrl,
  gallery,
  videoUrls,
  onChange,
}: EventMediaPickerProps) {
  const fr = locale === 'fr';
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState({ cover: '', gallery: '', video: '' });

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const runUpload = async (file: File, kind: 'cover' | 'gallery' | 'video') => {
    setError(null);
    setBusy(kind);
    try {
      const url = await uploadFile(file, kind);
      if (kind === 'cover') {
        onChange({ imageUrl: url, gallery, videoUrls });
      } else if (kind === 'gallery') {
        onChange({ imageUrl, gallery: [...gallery, url], videoUrls });
      } else {
        onChange({ imageUrl, gallery, videoUrls: [...videoUrls, url] });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload error');
    } finally {
      setBusy(null);
    }
  };

  const addUrl = (kind: 'cover' | 'gallery' | 'video') => {
    const raw = urlDraft[kind].trim();
    if (!raw) return;
    const url = kind === 'video' ? raw : normalizeImageUrl(raw) || raw;
    if (kind === 'cover') {
      onChange({ imageUrl: url, gallery, videoUrls });
      setUrlDraft((d) => ({ ...d, cover: '' }));
    } else if (kind === 'gallery') {
      onChange({ imageUrl, gallery: [...gallery, url], videoUrls });
      setUrlDraft((d) => ({ ...d, gallery: '' }));
    } else {
      onChange({ imageUrl, gallery, videoUrls: [...videoUrls, url] });
      setUrlDraft((d) => ({ ...d, video: '' }));
    }
  };

  return (
    <div className="space-y-5">
      {error ? (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      {/* Cover */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">
          {fr ? 'Photo de couverture' : 'Cover photo'}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!!busy}
            onClick={() => coverRef.current?.click()}
          >
            {busy === 'cover' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {fr ? 'Uploader' : 'Upload'}
          </Button>
          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void runUpload(f, 'cover');
              e.target.value = '';
            }}
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={urlDraft.cover}
            onChange={(e) => setUrlDraft((d) => ({ ...d, cover: e.target.value }))}
            placeholder="https://… (URL)"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => addUrl('cover')}>
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-default h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeImageUrl(imageUrl) || imageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white"
              onClick={() => onChange({ imageUrl: '', gallery, videoUrls })}
              aria-label="Remove cover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </section>

      {/* Gallery */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">
          {fr ? "Captures de l'événement" : 'Event photos'}
        </h3>
        <p className="text-xs text-muted">
          {fr
            ? 'Ajoute plusieurs photos (ambiance, speakers, moments clés).'
            : 'Add multiple photos (atmosphere, speakers, key moments).'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!!busy}
            onClick={() => galleryRef.current?.click()}
          >
            {busy === 'gallery' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {fr ? 'Ajouter des photos' : 'Add photos'}
          </Button>
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              void (async () => {
                for (const f of files) await runUpload(f, 'gallery');
              })();
              e.target.value = '';
            }}
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={urlDraft.gallery}
            onChange={(e) => setUrlDraft((d) => ({ ...d, gallery: e.target.value }))}
            placeholder="https://… (URL photo)"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => addUrl('gallery')}>
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gallery.map((url) => (
              <div key={url} className="relative aspect-video rounded-lg overflow-hidden border border-default">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeImageUrl(url) || url}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white"
                  onClick={() =>
                    onChange({ imageUrl, gallery: gallery.filter((g) => g !== url), videoUrls })
                  }
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Videos */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">
          {fr ? 'Vidéos' : 'Videos'}
        </h3>
        <p className="text-xs text-muted">
          {fr
            ? 'MP4 / WebM (max 80 Mo) ou lien YouTube / Drive.'
            : 'MP4 / WebM (max 80MB) or YouTube / Drive link.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!!busy}
            onClick={() => videoRef.current?.click()}
          >
            {busy === 'video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            {fr ? 'Uploader une vidéo' : 'Upload video'}
          </Button>
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void runUpload(f, 'video');
              e.target.value = '';
            }}
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={urlDraft.video}
            onChange={(e) => setUrlDraft((d) => ({ ...d, video: e.target.value }))}
            placeholder="https://… (YouTube, Drive, MP4)"
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => addUrl('video')}>
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
        {videoUrls.length > 0 ? (
          <ul className="space-y-2">
            {videoUrls.map((url) => (
              <li
                key={url}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border border-default bg-card-muted text-sm'
                )}
              >
                <Video className="w-4 h-4 text-brand-600 shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary hover:underline flex-1"
                >
                  {url}
                </a>
                <button
                  type="button"
                  className="p-1 rounded-md text-muted hover:text-primary"
                  onClick={() =>
                    onChange({
                      imageUrl,
                      gallery,
                      videoUrls: videoUrls.filter((v) => v !== url),
                    })
                  }
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

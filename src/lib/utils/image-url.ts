/**
 * Normalize external image URLs for display (Google Drive, Dropbox, protocol-less URLs).
 * Local public paths (/assets/..., /uploads/...) are left unchanged.
 */
export function normalizeImageUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  let url = raw.trim();
  if (!url) return undefined;

  // Site-relative assets (Next.js public/)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  if (url.startsWith('//')) {
    url = `https:${url}`;
  } else if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);

    // Google Drive sharing link → direct view
    const driveFile = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (driveFile && parsed.hostname.includes('google.com')) {
      return `https://drive.google.com/uc?export=view&id=${driveFile[1]}`;
    }

    const driveOpenId = parsed.searchParams.get('id');
    if (driveOpenId && parsed.hostname.includes('google.com') && parsed.pathname.includes('open')) {
      return `https://drive.google.com/uc?export=view&id=${driveOpenId}`;
    }

    // Dropbox ?dl=0 → raw
    if (parsed.hostname.includes('dropbox.com')) {
      parsed.searchParams.set('raw', '1');
      parsed.searchParams.delete('dl');
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

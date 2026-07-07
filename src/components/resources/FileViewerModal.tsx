'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Download, AlertCircle, Loader2, FileText, Eye } from 'lucide-react';

interface FileViewerModalProps {
    resourceId: string;
    fileName: string;
    fileType?: string;         // MIME type stored in DB (e.g. "application/pdf")
    fileExtension?: string;    // e.g. "pdf", "docx"
    isDownloadable: boolean;
    onClose: () => void;
}

type ViewerMode = 'pdf' | 'office' | 'image' | 'video' | 'audio' | 'text' | 'unsupported';

function getViewerMode(fileType?: string, fileName?: string): ViewerMode {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    const mime = fileType?.toLowerCase() || '';

    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';

    if (
        ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) ||
        mime.includes('msword') ||
        mime.includes('openxmlformats') ||
        mime.includes('ms-excel') ||
        mime.includes('ms-powerpoint')
    ) return 'office';

    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
        return 'image';

    if (mime.startsWith('video/') || ['mp4', 'webm'].includes(ext)) return 'video';

    if (mime.startsWith('audio/') || ['mp3', 'wav'].includes(ext)) return 'audio';

    if (
        mime.startsWith('text/') ||
        ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'md'].includes(ext)
    ) return 'text';

    return 'unsupported';
}

export function FileViewerModal({
    resourceId,
    fileName,
    fileType,
    fileExtension,
    isDownloadable,
    onClose,
}: FileViewerModalProps) {
    const mode = getViewerMode(fileType, fileName || fileExtension);
    const serveUrl = `/api/resources/${resourceId}/serve`;
    const downloadUrl = `${serveUrl}?download=true`;

    const [textContent, setTextContent] = useState<string | null>(null);
    const [textLoading, setTextLoading] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);

    // For Google Docs Viewer, we need an absolute URL
    const [officeViewerUrl, setOfficeViewerUrl] = useState<string | null>(null);

    useEffect(() => {
        // Build the absolute URL for Google Docs viewer (needs full URL)
        if (mode === 'office' && typeof window !== 'undefined') {
            const absolute = `${window.location.origin}${serveUrl}`;
            setOfficeViewerUrl(
                `https://docs.google.com/viewer?url=${encodeURIComponent(absolute)}&embedded=true`
            );
        }
    }, [mode, serveUrl]);

    useEffect(() => {
        if (mode !== 'text') return;
        setTextLoading(true);
        fetch(serveUrl)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load file');
                return res.text();
            })
            .then((text) => setTextContent(text))
            .catch((err) => setTextError(err.message))
            .finally(() => setTextLoading(false));
    }, [mode, serveUrl]);

    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)' }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white/10">
                        <Eye className="w-4 h-4 text-white/70" />
                    </div>
                    <span className="text-white font-medium truncate max-w-xs md:max-w-lg">
                        {fileName}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {isDownloadable && (
                        <a
                            href={downloadUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 border border-brand-500/30 transition-all text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Télécharger
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Viewer area */}
            <div className="flex-1 overflow-hidden relative">
                {/* PDF */}
                {mode === 'pdf' && (
                    <iframe
                        src={serveUrl}
                        className="w-full h-full border-none"
                        title={fileName}
                    />
                )}

                {/* Office docs via Google Docs Viewer */}
                {mode === 'office' && (
                    <>
                        {officeViewerUrl ? (
                            <iframe
                                src={officeViewerUrl}
                                className="w-full h-full border-none"
                                title={fileName}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                            </div>
                        )}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs px-3 py-1 rounded-full bg-black/50">
                            Aperçu via Google Docs Viewer
                        </div>
                    </>
                )}

                {/* Image */}
                {mode === 'image' && (
                    <div className="flex items-center justify-center h-full p-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={serveUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            style={{ userSelect: 'none' }}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                )}

                {/* Video */}
                {mode === 'video' && (
                    <div className="flex items-center justify-center h-full p-8">
                        <video
                            src={serveUrl}
                            controls
                            controlsList={isDownloadable ? undefined : 'nodownload'}
                            className="max-w-full max-h-full rounded-xl shadow-2xl"
                            style={{ maxHeight: 'calc(100vh - 120px)' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {/* Audio */}
                {mode === 'audio' && (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto">
                                <FileText className="w-10 h-10 text-white/60" />
                            </div>
                            <p className="text-white/60 text-center mb-4">{fileName}</p>
                            <audio
                                src={serveUrl}
                                controls
                                controlsList={isDownloadable ? undefined : 'nodownload'}
                                className="w-full"
                            />
                        </div>
                    </div>
                )}

                {/* Plain text / code */}
                {mode === 'text' && (
                    <div className="h-full overflow-auto p-6">
                        {textLoading && (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                            </div>
                        )}
                        {textError && (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                                <p className="text-white/60">{textError}</p>
                            </div>
                        )}
                        {textContent && (
                            <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                                {textContent}
                            </pre>
                        )}
                    </div>
                )}

                {/* Unsupported */}
                {mode === 'unsupported' && (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center max-w-sm">
                            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                            <h3 className="text-white font-semibold text-lg mb-2">
                                Aperçu non disponible
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
                            </p>
                            {isDownloadable && (
                                <a
                                    href={downloadUrl}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 border border-brand-500/30 transition-all text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger le fichier
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

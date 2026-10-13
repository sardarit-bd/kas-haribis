'use client';

import { useEffect, useState } from 'react';
import { renderPdfFirstPageFromUrl } from '../lib/pdf-cover';

export default function ArticleCoverPreview({
  articleId,
  title,
  hebrewTitle,
  publicationDate,
  coverUrl,
  pdfUrl,
}: {
  articleId: string;
  title: string;
  hebrewTitle?: string;
  publicationDate?: string;
  coverUrl?: string;
  pdfUrl?: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(coverUrl || null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (coverUrl) {
      setImageSrc(coverUrl);
      return;
    }

    if (!pdfUrl) return;

    let active = true;
    let objectUrl: string | null = null;
    setRendering(true);

    renderPdfFirstPageFromUrl(pdfUrl)
      .then((blob) => {
        if (!active) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }
      })
      .finally(() => {
        if (active) setRendering(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [coverUrl, pdfUrl]);

  const handleImageError = () => {
    if (pdfUrl && !rendering) {
      setImageSrc(null);
      setRendering(true);
      renderPdfFirstPageFromUrl(pdfUrl)
        .then((blob) => {
          if (blob) {
            setImageSrc(URL.createObjectURL(blob));
          }
        })
        .finally(() => {
          setRendering(false);
        });
    }
  };

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`First page of ${title}`}
        onError={handleImageError}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />
    );
  }

  return (
    <div className="w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b from-[#102a43] via-[#0b1d30] to-[#071524] text-center select-none relative overflow-hidden group-hover:brightness-105 transition duration-300">
      {/* Decorative traditional border frame */}
      <div className="absolute inset-2 sm:inset-3 border border-[#c69b46]/35 rounded pointer-events-none" />
      <div className="absolute inset-2.5 sm:inset-3.5 border border-[#c69b46]/15 rounded pointer-events-none" />

      {/* Top Header */}
      <div className="relative pt-2 sm:pt-3 z-10">
        <span className="block text-[#c69b46] font-serif text-2xl sm:text-3xl font-bold tracking-wide drop-shadow-sm">
          קו הריבית
        </span>
        <span className="block text-[#d4af37]/80 text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase mt-1">
          Center for Hilchos Ribbis
        </span>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c69b46]/60 to-transparent mx-auto mt-2" />
      </div>

      {/* Center Title / Parsha */}
      <div className="relative my-auto py-3 px-3 sm:px-4 z-10 flex flex-col items-center justify-center">
        {hebrewTitle && (
          <h4
            className="text-lg sm:text-xl font-serif font-bold text-[#e8c87e] leading-snug mb-2 line-clamp-2 drop-shadow-sm"
            dir="rtl"
          >
            {hebrewTitle}
          </h4>
        )}
        <p
          className="text-sm sm:text-base font-serif font-semibold text-white/95 leading-snug line-clamp-4"
          dir={/[֐-׿]/.test(title) ? 'rtl' : 'ltr'}
        >
          {title}
        </p>
      </div>

      {/* Bottom Metadata */}
      <div className="relative pb-2 sm:pb-3 z-10">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c69b46]/60 to-transparent mx-auto mb-2" />
        <span className="inline-block text-[#94a3b8] text-[11px] sm:text-xs font-sans font-medium">
          {publicationDate
            ? new Date(`${publicationDate}T00:00:00`).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                },
              )
            : 'Torah Publication'}
        </span>
        <span className="block text-[#c69b46]/90 text-[10px] font-sans font-semibold uppercase tracking-wider mt-0.5">
          Official Publication
        </span>
      </div>
    </div>
  );
}

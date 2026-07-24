import { useState } from 'react';

interface ImageDisplayProps {
  src: string;
  alt?: string;
  mimeType?: string;
}

export default function ImageDisplay({ src, alt, mimeType }: ImageDisplayProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isBase64 = src.startsWith('data:') || src.startsWith('base64');

  const imageSrc = isBase64
    ? src
    : `data:${mimeType || 'image/png'};base64,${src}`;

  return (
    <>
      <img
        src={imageSrc}
        alt={alt || 'Image'}
        onClick={() => setLightboxOpen(true)}
        className="max-w-sm max-h-48 rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity my-2"
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={imageSrc}
            alt={alt || 'Image'}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
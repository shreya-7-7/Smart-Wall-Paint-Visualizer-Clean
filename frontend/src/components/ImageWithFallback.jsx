import React, { useState } from 'react';

export function ImageWithFallback({ src, alt, className, fallback }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        {fallback || <span className="text-gray-400">{alt}</span>}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`${className} bg-gray-200 animate-pulse`}></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}

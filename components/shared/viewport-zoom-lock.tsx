'use client';

import { useEffect } from 'react';

export function ViewportZoomLock() {
  useEffect(() => {
    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener('gesturestart', preventGestureZoom, {
      passive: false,
    });

    document.addEventListener('gesturechange', preventGestureZoom, {
      passive: false,
    });

    document.addEventListener('gestureend', preventGestureZoom, {
      passive: false,
    });

    return () => {
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('gestureend', preventGestureZoom);
    };
  }, []);

  return null;
}

import React, { useEffect, useRef, useState } from 'react';

const CLOUDFRONT_VIDEO_URL = "https://res.cloudinary.com/dd3as4ova/video/upload/v1787307589/FYSH_platform_app_integration_202608211212_sigt6p.mp4";

export function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [framesReady, setFramesReady] = useState(false);
  const framesRef = useRef<string[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCapturing = true;
    let animId = 0;
    let lastTime = -1;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const handleLoadedMetadata = () => {
      const maxWidth = 960;
      const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
    };

    const captureFrame = () => {
      if (!isCapturing || !video || !ctx) return;
      if (video.currentTime !== lastTime && ctx && canvas.width > 0 && canvas.height > 0) {
        lastTime = video.currentTime;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        framesRef.current.push(dataUrl);
      }
      if (!video.ended && !video.paused) {
        if ('requestVideoFrameCallback' in video) {
          (video as any).requestVideoFrameCallback(captureFrame);
        } else {
          animId = requestAnimationFrame(captureFrame);
        }
      }
    };

    const handlePlay = () => {
      if ('requestVideoFrameCallback' in video) {
        (video as any).requestVideoFrameCallback(captureFrame);
      } else {
        animId = requestAnimationFrame(captureFrame);
      }
    };

    const handleEnded = () => {
      isCapturing = false;
      if (animId) cancelAnimationFrame(animId);
      if (framesRef.current.length > 0) {
        setFramesReady(true);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);

    // Attempt autoplay
    video.play().catch(() => {
      // Handle autoplay policy if muted fails or blocked
    });

    return () => {
      isCapturing = false;
      if (animId) cancelAnimationFrame(animId);
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  // Canvas boomerang playback loop
  useEffect(() => {
    if (!framesReady || framesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    let index = 0;
    let direction = 1; // 1 for forward, -1 for reverse
    let intervalId: number;

    const imageCache: HTMLImageElement[] = [];
    let loadedCount = 0;

    frames.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frames.length) {
          startBoomerang();
        }
      };
      imageCache[i] = img;
    });

    function startBoomerang() {
      // Set canvas dimensions based on first image
      if (imageCache[0]) {
        canvas.width = imageCache[0].width;
        canvas.height = imageCache[0].height;
      }

      const fps = 30;
      const interval = 1000 / fps;

      intervalId = window.setInterval(() => {
        const currentImg = imageCache[index];
        if (currentImg && ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(currentImg, 0, 0);
        }

        index += direction;
        if (index >= frames.length - 1) {
          index = frames.length - 1;
          direction = -1;
        } else if (index <= 0) {
          index = 0;
          direction = 1;
        }
      }, interval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [framesReady]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden scale-[1.15] origin-top pointer-events-none select-none">
      {/* Live capture video */}
      <video
        ref={videoRef}
        src={CLOUDFRONT_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover object-top ${framesReady ? 'hidden' : 'block'}`}
      />

      {/* Boomerang canvas playback */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover object-top ${framesReady ? 'block' : 'hidden'}`}
      />

      {/* Subtle light overlay to ensure pristine contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-brightness-105" />
    </div>
  );
}

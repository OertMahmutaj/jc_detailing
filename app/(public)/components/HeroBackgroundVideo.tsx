"use client";

import { useEffect, useRef, useState } from "react";

const mobileVideo = "/hero_vid_mobile_hq.mp4";
const desktopVideo = "/hero_vid_desktop_hq.mp4";

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const selectVideo = () => {
      setVideoSource(mobileQuery.matches ? mobileVideo : desktopVideo);
    };

    selectVideo();
    mobileQuery.addEventListener("change", selectVideo);

    return () => mobileQuery.removeEventListener("change", selectVideo);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoSource) {
      return;
    }

    video.defaultMuted = true;
    video.muted = true;
    video.load();

    const playVideo = () => {
      if (!document.hidden) {
        void video.play().catch(() => {
          // The poster remains visible when the device blocks autoplay.
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        playVideo();
      }
    };

    video.addEventListener("canplay", playVideo);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerdown", playVideo, {
      once: true,
      passive: true,
    });
    playVideo();

    return () => {
      video.removeEventListener("canplay", playVideo);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerdown", playVideo);
    };
  }, [videoSource]);

  return (
    <video
      ref={videoRef}
      autoPlay
      disablePictureInPicture
      disableRemotePlayback
      loop
      muted
      playsInline
      poster="/hero_poster.webp"
      preload="auto"
      src={videoSource ?? undefined}
    />
  );
}

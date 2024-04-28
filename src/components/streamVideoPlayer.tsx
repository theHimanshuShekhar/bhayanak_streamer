import { useEffect, useRef } from "react";

export function VideoPlayer(props: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Bind MediaSource to video element
    if (props.stream && props.stream.active && videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, [props.stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      className="border-2 rounded-lg object-cover aspect-video min-w-full"
    />
  );
}

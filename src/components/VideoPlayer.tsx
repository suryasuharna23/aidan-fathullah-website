import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
}

export const VideoPlayer = ({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = isYouTube ? getYouTubeId(videoUrl) : null;

  if (isYouTube && youtubeId) {
    return (
      <div className="relative overflow-hidden rounded-xl shadow-warm group">
        <div className="aspect-video">
          {!isPlaying ? (
            <div 
              className="relative w-full h-full cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                alt={title || "Video thumbnail"}
                className="w-full h-full object-cover image-sepia group-hover:sepia-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center group-hover:bg-foreground/40 transition-colors">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={title || "Video"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {title && !isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent">
            <p className="text-primary-foreground font-body">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Regular video
  return (
    <div className="relative overflow-hidden rounded-xl shadow-warm">
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video"
        poster={thumbnailUrl}
      >
        Your browser does not support the video tag.
      </video>
      {title && (
        <div className="p-4 bg-card border-t border-border">
          <p className="font-body text-foreground">{title}</p>
        </div>
      )}
    </div>
  );
};

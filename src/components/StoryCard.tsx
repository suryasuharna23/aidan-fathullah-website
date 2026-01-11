import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Story {
  id: string;
  author: string;
  author_image?: string;
  story_images?: string[];
  content: string;
  date?: string;
  created_at?: string;
}

interface StoryCardProps {
  story: Story;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const nextImage = () => {
    if (story.story_images) {
      setCurrentImageIndex((prev) =>
        prev === story.story_images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (story.story_images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? story.story_images!.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Card className="card-gradient shadow-card hover:shadow-warm transition-all duration-500 overflow-hidden group">
      {story.story_images && story.story_images.length > 0 && (
        <div className="relative aspect-video overflow-hidden">
          {/* Image */}
          <img
            src={story.story_images[currentImageIndex]}
            alt={`Story image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover image-sepia group-hover:scale-105 transition-transform duration-700"
          />

          {/* Navigation Arrows - only show if more than 1 image */}
          {story.story_images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {story.story_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {story.story_images.length}
              </div>
            </>
          )}
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-warm-sepia">
            <AvatarImage src={story.author_image} alt={story.author} />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {getInitials(story.author)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-serif font-semibold text-foreground">
              {story.author}
            </h4>
            {story.date && (
              <p className="text-sm text-muted-foreground">{story.date}</p>
            )}
          </div>
        </div>
        <p className="font-body text-foreground/90 leading-relaxed">
          {story.content}
        </p>
      </CardContent>
    </Card>
  );
};

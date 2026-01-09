import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface PhotoCarouselProps {
  photos: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  className?: string;
}

export const PhotoCarousel = ({ photos, className }: PhotoCarouselProps) => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className={cn("w-full", className)}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {photos.map((photo, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
            <div className="group relative overflow-hidden rounded-xl shadow-card hover:shadow-warm transition-all duration-500">
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover image-sepia group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                  <p className="text-primary-foreground font-body text-sm">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
      <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
    </Carousel>
  );
};

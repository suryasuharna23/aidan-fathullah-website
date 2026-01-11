import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Story {
  id: string;
  author: string;
  author_image?: string;
  story_image?: string;
  content: string;
  date?: string;
  created_at?: string;
}

interface StoryCardProps {
  story: Story;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="card-gradient shadow-card hover:shadow-warm transition-all duration-500 overflow-hidden group">
      {story.story_image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={story.story_image}
            alt="Story image"
            className="w-full h-full object-cover image-sepia group-hover:scale-105 transition-transform duration-700"
          />
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

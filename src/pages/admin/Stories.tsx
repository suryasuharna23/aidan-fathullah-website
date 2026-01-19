import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  BookOpen,
  Trash2,
  Loader2,
  MoreVertical,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  author: string;
  content: string;
  author_image?: string;
  story_images?: string[];
  date: string;
  created_at: string;
}

export default function AdminStories() {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Gagal memuat cerita",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStory) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", selectedStory.id);

      if (error) throw error;

      setStories(stories.filter((s) => s.id !== selectedStory.id));
      setShowDeleteDialog(false);
      setSelectedStory(null);
      toast({
        title: "Berhasil",
        description: "Cerita berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting story:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus cerita",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (story: Story) => {
    setSelectedStory(story);
    setShowDeleteDialog(true);
  };

  const openViewDialog = (story: Story) => {
    setSelectedStory(story);
    setShowViewDialog(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <span className="font-semibold text-lg">Kelola Cerita</span>
            </div>
          </div>
          <Badge variant="secondary">{stories.length} Cerita</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada cerita</h3>
            <p className="text-muted-foreground">
              Cerita dari pengunjung akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Author Image */}
                    <div className="flex-shrink-0">
                      {story.author_image ? (
                        <img
                          src={story.author_image}
                          alt={story.author}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{story.author}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(story.created_at)}</span>
                            {story.story_images && story.story_images.length > 0 && (
                              <>
                                <span>•</span>
                                <ImageIcon className="w-3 h-3" />
                                <span>{story.story_images.length} foto</span>
                              </>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(story)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(story)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="mt-3 text-foreground/80 line-clamp-3">
                        {story.content}
                      </p>

                      {/* Story Images Preview */}
                      {story.story_images && story.story_images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                          {story.story_images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Story image ${idx + 1}`}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          ))}
                          {story.story_images.length > 3 && (
                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-sm text-muted-foreground">
                                +{story.story_images.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Story Dialog */}
        <AlertDialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                {selectedStory?.author_image ? (
                  <img
                    src={selectedStory.author_image}
                    alt={selectedStory?.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <span>{selectedStory?.author}</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedStory && formatDate(selectedStory.created_at)}
                  </p>
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left whitespace-pre-wrap text-foreground/80">
                {selectedStory?.content}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Story Images */}
            {selectedStory?.story_images && selectedStory.story_images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {selectedStory.story_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Story image ${idx + 1}`}
                    className="w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Tutup</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowViewDialog(false);
                  if (selectedStory) openDeleteDialog(selectedStory);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Cerita
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Cerita?</AlertDialogTitle>
              <AlertDialogDescription>
                Cerita dari "{selectedStory?.author}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

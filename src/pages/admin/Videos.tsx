import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Video,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Play,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return "";
};

export default function AdminVideos() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    url: "",
    title: "",
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Gagal memuat video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.url.trim()) {
      toast({
        title: "Error",
        description: "Masukkan URL video",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase
        .from("videos")
        .insert([
          {
            url: formData.url,
            title: formData.title || "Untitled Video",
          },
        ])
        .select();

      if (error) throw error;

      setVideos([data[0], ...videos]);
      resetForm();
      setShowAddDialog(false);
      toast({
        title: "Berhasil",
        description: "Video berhasil ditambahkan",
      });
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan video",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedVideo) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("videos")
        .update({
          url: formData.url,
          title: formData.title,
        })
        .eq("id", selectedVideo.id);

      if (error) throw error;

      setVideos(
        videos.map((v) =>
          v.id === selectedVideo.id
            ? { ...v, url: formData.url, title: formData.title }
            : v
        )
      );
      resetForm();
      setShowEditDialog(false);
      toast({
        title: "Berhasil",
        description: "Video berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui video",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", selectedVideo.id);

      if (error) throw error;

      setVideos(videos.filter((v) => v.id !== selectedVideo.id));
      setShowDeleteDialog(false);
      setSelectedVideo(null);
      toast({
        title: "Berhasil",
        description: "Video berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus video",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ url: "", title: "" });
    setSelectedVideo(null);
  };

  const openEditDialog = (video: VideoItem) => {
    setSelectedVideo(video);
    setFormData({
      url: video.url,
      title: video.title,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (video: VideoItem) => {
    setSelectedVideo(video);
    setShowDeleteDialog(true);
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
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-500" />
              </div>
              <span className="font-semibold text-lg">Kelola Video</span>
            </div>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Video Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan video YouTube ke galeri
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL Video (YouTube)</Label>
                  <Input
                    id="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Masukkan URL video YouTube
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Video</Label>
                  <Input
                    id="title"
                    placeholder="Judul untuk video ini"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                {formData.url && getYouTubeVideoId(formData.url) && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={getYouTubeThumbnail(formData.url)}
                      alt="Video thumbnail"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleAdd} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada video</h3>
            <p className="text-muted-foreground mb-4">
              Mulai tambahkan video ke galeri
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  {getYouTubeVideoId(video.url) ? (
                    <img
                      src={getYouTubeThumbnail(video.url)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                    >
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => openEditDialog(video)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(video)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 rounded-full p-1.5">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{video.title}</h3>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka di YouTube
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Perbarui informasi video</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-url">URL Video (YouTube)</Label>
                <Input
                  id="edit-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Judul Video</Label>
                <Input
                  id="edit-title"
                  placeholder="Judul untuk video ini"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              {formData.url && getYouTubeVideoId(formData.url) && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={getYouTubeThumbnail(formData.url)}
                    alt="Video thumbnail"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Video?</AlertDialogTitle>
              <AlertDialogDescription>
                Video "{selectedVideo?.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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

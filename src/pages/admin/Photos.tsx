import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Image,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  src: string;
  alt: string;
  caption: string;
  created_at: string;
}

export default function AdminPhotos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    file: null as File | null,
    alt: "",
    caption: "",
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [user]);

  const fetchPhotos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Ambil memorial IDs yang dimiliki admin ini
      const { data: memorials, error: memorialsError } = await supabase
        .from("memorials")
        .select("id")
        .eq("admin_id", user.id);

      if (memorialsError) throw memorialsError;

      const memorialIds = memorials?.map(m => m.id) || [];

      // Jika admin belum punya memorial, tampilkan kosong
      if (memorialIds.length === 0) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      // Fetch photos yang terkait dengan memorial admin ini
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .in("memorial_id", memorialIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Error",
        description: "Gagal memuat foto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    if (!formData.file) {
      toast({
        title: "Error",
        description: "Pilih file foto terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const imageUrl = await uploadImage(formData.file);
      if (!imageUrl) throw new Error("Failed to upload image");

      const { data, error } = await supabase
        .from("photos")
        .insert([
          {
            src: imageUrl,
            alt: formData.alt || "Foto Mas Idan",
            caption: formData.caption,
          },
        ])
        .select();

      if (error) throw error;

      setPhotos([data[0], ...photos]);
      resetForm();
      setShowAddDialog(false);
      toast({
        title: "Berhasil",
        description: "Foto berhasil ditambahkan",
      });
    } catch (error) {
      console.error("Error adding photo:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan foto",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPhoto) return;

    try {
      setSubmitting(true);

      let imageUrl = selectedPhoto.src;

      // Upload new image if provided
      if (formData.file) {
        const newUrl = await uploadImage(formData.file);
        if (newUrl) imageUrl = newUrl;
      }

      const { error } = await supabase
        .from("photos")
        .update({
          src: imageUrl,
          alt: formData.alt,
          caption: formData.caption,
        })
        .eq("id", selectedPhoto.id);

      if (error) throw error;

      setPhotos(
        photos.map((p) =>
          p.id === selectedPhoto.id
            ? { ...p, src: imageUrl, alt: formData.alt, caption: formData.caption }
            : p
        )
      );
      resetForm();
      setShowEditDialog(false);
      toast({
        title: "Berhasil",
        description: "Foto berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui foto",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", selectedPhoto.id);

      if (error) throw error;

      setPhotos(photos.filter((p) => p.id !== selectedPhoto.id));
      setShowDeleteDialog(false);
      setSelectedPhoto(null);
      toast({
        title: "Berhasil",
        description: "Foto berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus foto",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ file: null, alt: "", caption: "" });
    setPreview(null);
    setSelectedPhoto(null);
  };

  const openEditDialog = (photo: Photo) => {
    setSelectedPhoto(photo);
    setFormData({
      file: null,
      alt: photo.alt,
      caption: photo.caption,
    });
    setPreview(photo.src);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (photo: Photo) => {
    setSelectedPhoto(photo);
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
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-semibold text-lg">Kelola Foto</span>
            </div>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Foto Baru</DialogTitle>
                <DialogDescription>
                  Upload foto baru ke galeri
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Foto</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => {
                            setFormData({ ...formData, file: null });
                            setPreview(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Klik untuk upload foto
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    placeholder="Deskripsi singkat foto"
                    value={formData.alt}
                    onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Keterangan</Label>
                  <Textarea
                    id="caption"
                    placeholder="Keterangan untuk foto ini"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  />
                </div>
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
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada foto</h3>
            <p className="text-muted-foreground mb-4">
              Mulai tambahkan foto ke galeri
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Foto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => openEditDialog(photo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(photo)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {photo.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground truncate">
                      {photo.caption}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Foto</DialogTitle>
              <DialogDescription>Perbarui informasi foto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Foto</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {preview && (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded">
                        <span className="text-white text-sm">Ganti foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-alt">Alt Text</Label>
                <Input
                  id="edit-alt"
                  placeholder="Deskripsi singkat foto"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-caption">Keterangan</Label>
                <Textarea
                  id="edit-caption"
                  placeholder="Keterangan untuk foto ini"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                />
              </div>
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
              <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
              <AlertDialogDescription>
                Foto ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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

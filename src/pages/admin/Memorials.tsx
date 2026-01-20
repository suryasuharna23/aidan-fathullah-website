import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  User,
  Settings,
  LogOut,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  Image,
  Calendar,
  MapPin,
  ExternalLink,
  X,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Memorial {
  id: string;
  slug: string;
  name: string;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  bio: string | null;
  quote: string | null;
  quote_author: string | null;
  profile_image: string | null;
  cover_image: string | null;
  likes: string[] | null;
  dislikes: string[] | null;
  is_public: boolean;
  created_at: string;
}

interface MemorialForm {
  name: string;
  birth_date: string;
  death_date: string;
  birth_place: string;
  bio: string;
  quote: string;
  quote_author: string;
  likes: string;
  dislikes: string;
  is_public: boolean;
}

const initialFormState: MemorialForm = {
  name: "",
  birth_date: "",
  death_date: "",
  birth_place: "",
  bio: "",
  quote: "",
  quote_author: "",
  likes: "",
  dislikes: "",
  is_public: true,
};

export default function AdminMemorials() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMemorial, setEditingMemorial] = useState<Memorial | null>(null);
  const [form, setForm] = useState<MemorialForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  
  // Image states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMemorials();
  }, [user]);

  const fetchMemorials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("admin_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemorials(data || []);
    } catch (error) {
      console.error("Error fetching memorials:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data memorial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from("media").upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: "Error",
        description: "Nama wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Upload images if provided
      let profileImageUrl = editingMemorial?.profile_image || null;
      let coverImageUrl = editingMemorial?.cover_image || null;

      if (profileImage) {
        const url = await uploadImage(profileImage, "profiles");
        if (url) profileImageUrl = url;
      }

      if (coverImage) {
        const url = await uploadImage(coverImage, "covers");
        if (url) coverImageUrl = url;
      }

      const memorialData = {
        name: form.name,
        slug: editingMemorial?.slug || generateSlug(form.name),
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        birth_place: form.birth_place || null,
        bio: form.bio || null,
        quote: form.quote || null,
        quote_author: form.quote_author || null,
        profile_image: profileImageUrl,
        cover_image: coverImageUrl,
        likes: form.likes ? form.likes.split(",").map((s) => s.trim()).filter(Boolean) : null,
        dislikes: form.dislikes ? form.dislikes.split(",").map((s) => s.trim()).filter(Boolean) : null,
        is_public: form.is_public,
        admin_id: user!.id,
      };

      if (editingMemorial) {
        // Update existing memorial
        const { error } = await supabase
          .from("memorials")
          .update(memorialData)
          .eq("id", editingMemorial.id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Memorial berhasil diperbarui",
        });
      } else {
        // Create new memorial
        const { error } = await supabase.from("memorials").insert([memorialData]);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Memorial berhasil dibuat",
        });
      }

      // Reset form and refresh data
      setShowDialog(false);
      setEditingMemorial(null);
      setForm(initialFormState);
      setProfileImage(null);
      setCoverImage(null);
      setProfilePreview(null);
      setCoverPreview(null);
      fetchMemorials();
    } catch (error) {
      console.error("Error saving memorial:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan memorial",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (memorial: Memorial) => {
    setEditingMemorial(memorial);
    setForm({
      name: memorial.name,
      birth_date: memorial.birth_date || "",
      death_date: memorial.death_date || "",
      birth_place: memorial.birth_place || "",
      bio: memorial.bio || "",
      quote: memorial.quote || "",
      quote_author: memorial.quote_author || "",
      likes: memorial.likes?.join(", ") || "",
      dislikes: memorial.dislikes?.join(", ") || "",
      is_public: memorial.is_public,
    });
    setProfilePreview(memorial.profile_image);
    setCoverPreview(memorial.cover_image);
    setShowDialog(true);
  };

  const handleDelete = async (memorial: Memorial) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus memorial "${memorial.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("memorials").delete().eq("id", memorial.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Memorial berhasil dihapus",
      });
      fetchMemorials();
    } catch (error) {
      console.error("Error deleting memorial:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus memorial",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari panel admin",
    });
    navigate("/admin/login");
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/" target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Website
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kelola Memorial</h1>
            <p className="text-muted-foreground mt-1">
              Buat dan kelola memorial untuk orang-orang tersayang
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMemorial(null);
              setForm(initialFormState);
              setProfileImage(null);
              setCoverImage(null);
              setProfilePreview(null);
              setCoverPreview(null);
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Memorial
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8">
          <Button variant="outline" asChild>
            <Link to="/admin">Dashboard</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/admin/memorials">Memorial</Link>
          </Button>
        </div>

        {/* Memorial List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Memuat data...</span>
          </div>
        ) : memorials.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Memorial
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Buat memorial pertama Anda untuk mulai mengabadikan kenangan orang tersayang.
              </p>
              <Button
                onClick={() => {
                  setEditingMemorial(null);
                  setForm(initialFormState);
                  setShowDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Memorial Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorials.map((memorial) => (
              <Card key={memorial.id} className="overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-32 bg-muted">
                  {memorial.cover_image ? (
                    <img
                      src={memorial.cover_image}
                      alt={memorial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  {/* Profile Image */}
                  <div className="absolute -bottom-8 left-4">
                    <div className="w-16 h-16 rounded-full border-4 border-background bg-muted overflow-hidden">
                      {memorial.profile_image ? (
                        <img
                          src={memorial.profile_image}
                          alt={memorial.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <User className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        memorial.is_public
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {memorial.is_public ? "Publik" : "Private"}
                    </span>
                  </div>
                </div>

                <CardHeader className="pt-10">
                  <CardTitle className="text-lg">{memorial.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {memorial.bio || "Belum ada deskripsi"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {memorial.birth_place && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{memorial.birth_place}</span>
                      </div>
                    )}
                    {(memorial.birth_date || memorial.death_date) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {memorial.birth_date
                            ? new Date(memorial.birth_date).getFullYear()
                            : "?"}{" "}
                          -{" "}
                          {memorial.death_date
                            ? new Date(memorial.death_date).getFullYear()
                            : "Sekarang"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(memorial)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/memorial/${memorial.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(memorial)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Memorial Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMemorial ? "Edit Memorial" : "Buat Memorial Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingMemorial
                ? "Perbarui informasi memorial"
                : "Isi informasi untuk membuat memorial baru"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"
                required
              />
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Foto Profil</label>
              {profilePreview ? (
                <div className="relative w-24 h-24">
                  <img
                    src={profilePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setProfilePreview(null);
                    }}
                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors w-fit">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload foto profil</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Foto Cover</label>
              {coverPreview ? (
                <div className="relative w-full h-32">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload foto cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Wafat</label>
                <Input
                  type="date"
                  value={form.death_date}
                  onChange={(e) => setForm({ ...form, death_date: e.target.value })}
                />
              </div>
            </div>

            {/* Birth Place */}
            <div>
              <label className="block text-sm font-medium mb-2">Tempat Lahir</label>
              <Input
                value={form.birth_place}
                onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
                placeholder="Kota, Negara"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">Biografi</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Ceritakan tentang orang ini..."
                rows={4}
              />
            </div>

            {/* Quote */}
            <div>
              <label className="block text-sm font-medium mb-2">Quote</label>
              <Textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="Kutipan yang menginspirasi..."
                rows={2}
              />
            </div>

            {/* Quote Author */}
            <div>
              <label className="block text-sm font-medium mb-2">Penulis Quote</label>
              <Input
                value={form.quote_author}
                onChange={(e) => setForm({ ...form, quote_author: e.target.value })}
                placeholder="Nama penulis quote"
              />
            </div>

            {/* Likes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Hal yang Disukai (pisahkan dengan koma)
              </label>
              <Input
                value={form.likes}
                onChange={(e) => setForm({ ...form, likes: e.target.value })}
                placeholder="Kopi, Membaca, Musik, dll"
              />
            </div>

            {/* Dislikes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Hal yang Tidak Disukai (pisahkan dengan koma)
              </label>
              <Input
                value={form.dislikes}
                onChange={(e) => setForm({ ...form, dislikes: e.target.value })}
                placeholder="Ketidakjujuran, Kebisingan, dll"
              />
            </div>

            {/* Public/Private */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_public" className="text-sm">
                Memorial ini dapat dilihat publik
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingMemorial ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Memorial"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

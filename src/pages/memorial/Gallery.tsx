import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Loader2, Plus, X, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Photo {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

interface VideoItem {
  id: string;
  url: string;
  title: string;
}

interface Memorial {
  id: string;
  name: string;
}

const MemorialGallery = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingMemorial, setLoadingMemorial] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New photo form
  const [newPhoto, setNewPhoto] = useState({
    file: null as File | null,
    alt: "",
    caption: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // New video form
  const [newVideo, setNewVideo] = useState({
    url: "",
    title: "",
  });

  // Fetch memorial first
  useEffect(() => {
    if (slug) {
      fetchMemorial();
    }
  }, [slug]);

  // Fetch photos and videos after memorial is loaded
  useEffect(() => {
    if (memorial?.id) {
      fetchPhotos();
      fetchVideos();
    }
  }, [memorial?.id]);

  const fetchMemorial = async () => {
    try {
      setLoadingMemorial(true);
      const { data, error } = await supabase
        .from("memorials")
        .select("id, name")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Memorial tidak ditemukan");
        } else {
          throw error;
        }
        return;
      }

      setMemorial(data);
    } catch (err) {
      console.error("Error fetching memorial:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoadingMemorial(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("memorial_id", memorial!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("memorial_id", memorial!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Handle photo file change
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto({ ...newPhoto, file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Upload photo to storage
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `photos/${memorial!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Submit new photo
  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPhoto.file) {
      alert("Silakan pilih foto terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload to storage
      const photoUrl = await uploadPhoto(newPhoto.file);
      if (!photoUrl) throw new Error("Gagal upload foto");

      // Insert to database
      const { data, error } = await supabase
        .from("photos")
        .insert([
          {
            src: photoUrl,
            alt: newPhoto.alt || "Foto kenangan",
            caption: newPhoto.caption,
            memorial_id: memorial!.id,
          },
        ])
        .select();

      if (error) throw error;

      // Add to state
      if (data) {
        setPhotos([data[0], ...photos]);
      }

      // Reset form
      setNewPhoto({ file: null, alt: "", caption: "" });
      setPhotoPreview(null);
      setShowPhotoForm(false);
    } catch (err) {
      console.error("Error submitting photo:", err);
      alert("Gagal menambahkan foto. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit new video
  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVideo.url.trim()) {
      alert("Silakan masukkan URL video.");
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase
        .from("videos")
        .insert([
          {
            url: newVideo.url,
            title: newVideo.title || "Video kenangan",
            memorial_id: memorial!.id,
          },
        ])
        .select();

      if (error) throw error;

      // Add to state
      if (data) {
        setVideos([data[0], ...videos]);
      }

      // Reset form
      setNewVideo({ url: "", title: "" });
      setShowVideoForm(false);
    } catch (err) {
      console.error("Error submitting video:", err);
      alert("Gagal menambahkan video. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMemorial) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Memuat galeri...</span>
        </div>
      </div>
    );
  }

  if (error || !memorial) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {error || "Memorial Tidak Ditemukan"}
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Memorial yang Anda cari tidak ada atau tidak tersedia.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
          >
            Kembali ke Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 hero-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={`Galeri ${memorial.name}`}
            subtitle="Momen-momen berharga yang terabadikan selamanya dalam foto dan video"
          />
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="photos" className="w-full">
            <div className="flex justify-center mb-8 md:mb-12">
              <TabsList className="bg-muted p-1 rounded-full">
                <TabsTrigger
                  value="photos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Foto
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="photos" className="animate-fade-in">
              {loadingPhotos ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Memuat foto...</span>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Belum ada foto.</p>
                </div>
              ) : (
                <>
                  {/* Photo Carousel */}
                  <div className="mb-12">
                    <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                      Slideshow Foto
                    </h3>
                    <PhotoCarousel photos={photos} />
                  </div>

                  {/* Photo Grid */}
                  <div className="mt-16">
                    <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                      Semua Foto
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id || index}
                          className="group relative aspect-square overflow-hidden rounded-xl shadow-card hover:shadow-warm transition-all duration-500 cursor-pointer"
                        >
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-full object-cover image-sepia group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-primary-foreground font-body text-sm">
                                {photo.caption}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Add Photo Button */}
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setShowPhotoForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Foto
                </button>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                  Video Kenangan
                </h3>

                {loadingVideos ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Memuat video...</span>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">Belum ada video.</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {videos.map((video, index) => (
                      <VideoPlayer
                        key={video.id || index}
                        videoUrl={video.url}
                        title={video.title}
                      />
                    ))}
                  </div>
                )}

                {/* Add Video Button */}
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setShowVideoForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Video
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Photo Form Modal */}
      {showPhotoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-serif text-xl font-semibold">Tambah Foto</h3>
              <button
                onClick={() => {
                  setShowPhotoForm(false);
                  setPhotoPreview(null);
                  setNewPhoto({ file: null, alt: "", caption: "" });
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPhoto} className="p-4 space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Foto</label>
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setNewPhoto({ ...newPhoto, file: null });
                      }}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Klik untuk upload foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium mb-2">Alt Text (opsional)</label>
                <input
                  type="text"
                  value={newPhoto.alt}
                  onChange={(e) => setNewPhoto({ ...newPhoto, alt: e.target.value })}
                  placeholder="Deskripsi singkat foto"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium mb-2">Caption (opsional)</label>
                <textarea
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  placeholder="Ceritakan tentang foto ini..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !newPhoto.file}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengupload...
                  </span>
                ) : (
                  "Tambah Foto"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Form Modal */}
      {showVideoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-serif text-xl font-semibold">Tambah Video</h3>
              <button
                onClick={() => {
                  setShowVideoForm(false);
                  setNewVideo({ url: "", title: "" });
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitVideo} className="p-4 space-y-4">
              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium mb-2">URL Video</label>
                <input
                  type="url"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mendukung YouTube, Vimeo, dan video langsung
                </p>
              </div>

              {/* Video Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Judul Video</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="Judul video kenangan"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !newVideo.url.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  "Tambah Video"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MemorialGallery;

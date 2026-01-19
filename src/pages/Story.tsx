import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { StoryCard, Story } from "@/components/StoryCard";
import { PenLine, Loader2, X, Upload, Image, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const StoryPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tambahkan state untuk form
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ 
    author: "", 
    content: "",
    storyDate: "",
    authorImageFile: null as File | null,
    storyImageFiles: [] as File[]
  });
  const [authorImagePreview, setAuthorImagePreview] = useState<string | null>(null);
  const [storyImagePreviews, setStoryImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch stories dari Supabase
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("stories")
          .select("*")
          .order("story_date", { ascending: false });

        if (error) {
          throw error;
        }

        // Format tanggal untuk display dan simpan story_date untuk sorting
        const formattedStories = data?.map((story) => ({
          ...story,
          story_date: story.story_date, // Simpan untuk sorting
          date: story.story_date
            ? new Date(story.story_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : story.created_at
            ? new Date(story.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : undefined,
        })) || [];

        setStories(formattedStories);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Gagal memuat cerita. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Fungsi untuk submit cerita baru
  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStory.author.trim() || !newStory.content.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      // Upload author image jika ada
      let authorImageUrl: string | undefined;
      if (newStory.authorImageFile) {
        const url = await uploadImage(newStory.authorImageFile, 'authors');
        if (url) authorImageUrl = url;
      }

      // Upload story images jika ada
      const storyImageUrls: string[] = [];
      for (const file of newStory.storyImageFiles) {
        const url = await uploadImage(file, 'stories');
        if (url) storyImageUrls.push(url);
      }

      const { data, error } = await supabase
        .from("stories")
        .insert([
          {
            author: newStory.author,
            content: newStory.content,
            author_image: authorImageUrl,
            story_images: storyImageUrls.length > 0 ? storyImageUrls : null,
            story_date: newStory.storyDate || null,
          },
        ])
        .select();

      if (error) throw error;

      // Tambahkan ke list stories dan sort berdasarkan tanggal
      if (data) {
        const formattedStory = {
          ...data[0],
          story_date: data[0].story_date,
          date: data[0].story_date 
            ? new Date(data[0].story_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date(data[0].created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
        };
        
        // Sort stories berdasarkan story_date (descending)
        const updatedStories = [...stories, formattedStory].sort((a, b) => {
          const dateA = a.story_date ? new Date(a.story_date).getTime() : 0;
          const dateB = b.story_date ? new Date(b.story_date).getTime() : 0;
          return dateB - dateA; // Descending (terbaru di atas)
        });
        
        setStories(updatedStories);
      }

      // Reset form
      setNewStory({ author: "", content: "", storyDate: "", authorImageFile: null, storyImageFiles: [] });
      setAuthorImagePreview(null);
      setStoryImagePreviews([]);
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting story:", err);
      alert("Gagal mengirim cerita. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle author image
  const handleAuthorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewStory({ ...newStory, authorImageFile: file });
      setAuthorImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle story images (multiple)
  const handleStoryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewStory({ 
        ...newStory, 
        storyImageFiles: [...newStory.storyImageFiles, ...files] 
      });
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setStoryImagePreviews([...storyImagePreviews, ...newPreviews]);
    }
  };

  // Remove story image
  const removeStoryImage = (index: number) => {
    const newFiles = newStory.storyImageFiles.filter((_, i) => i !== index);
    const newPreviews = storyImagePreviews.filter((_, i) => i !== index);
    setNewStory({ ...newStory, storyImageFiles: newFiles });
    setStoryImagePreviews(newPreviews);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('story-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('story-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 hero-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Cerita Tentang Mas Idan"
            subtitle="Kenangan dan kisah dari orang-orang yang pernah mengenal dan mencintai Mas Idan"
          />
        </div>
      </section>

      {/* Stories Timeline */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat cerita...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive">{error}</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Belum ada cerita yang dibagikan.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>
                
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className={`relative flex items-start gap-6 md:gap-12 pb-12 animate-fade-up ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                    
                    {/* Date Badge - Mobile */}
                    <div className="md:hidden pl-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {story.date || "Tanggal tidak diketahui"}
                      </div>
                    </div>
                    
                    {/* Date - Desktop */}
                    <div className={`hidden md:flex flex-1 ${index % 2 === 0 ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                        <Calendar className="w-4 h-4" />
                        {story.date || "Tanggal tidak diketahui"}
                      </div>
                    </div>
                    
                    {/* Story Card */}
                    <div className={`flex-1 pl-10 md:pl-0 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                      <StoryCard story={story} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 memorial-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <PenLine className="w-12 h-12 text-accent mx-auto mb-6" />
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Bagikan Cerita Anda
            </h3>
            <p className="font-body text-muted-foreground mb-8">
              Apakah Anda memiliki kenangan indah bersama Mas Idan? Bagikan cerita Anda 
              dan biarkan kenangan itu hidup selamanya di hati kita bersama.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm"
            >
              <PenLine className="w-4 h-4" />
              Tulis Cerita
            </button>
          </div>
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-serif text-xl font-semibold">Tulis Cerita Anda</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setAuthorImagePreview(null);
                  setStoryImagePreviews([]);
                  setNewStory({ author: "", content: "", storyDate: "", authorImageFile: null, storyImageFiles: [] });
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitStory} className="p-4 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium mb-2">Nama Anda</label>
                <input
                  type="text"
                  value={newStory.author}
                  onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Tanggal Kenangan */}
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Kenangan</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={newStory.storyDate}
                    onChange={(e) => setNewStory({ ...newStory, storyDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Kapan kenangan ini terjadi?</p>
              </div>

              {/* Foto Profil */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto Profil (opsional)</label>
                <div className="flex items-center gap-4">
                  {authorImagePreview ? (
                    <div className="relative">
                      <img 
                        src={authorImagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAuthorImagePreview(null);
                          setNewStory({ ...newStory, authorImageFile: null });
                        }}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAuthorImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <span className="text-sm text-muted-foreground">Klik untuk upload foto</span>
                </div>
              </div>

              {/* Cerita */}
              <div>
                <label className="block text-sm font-medium mb-2">Cerita Anda</label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  placeholder="Bagikan kenangan Anda bersama Mas Idan..."
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              {/* Foto Cerita (Multiple) */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto Kenangan (opsional)</label>
                <div className="space-y-3">
                  {storyImagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {storyImagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeStoryImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <Image className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tambah foto kenangan</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleStoryImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setAuthorImagePreview(null);
                    setStoryImagePreviews([]);
                    setNewStory({ author: "", content: "", storyDate: "", authorImageFile: null, storyImageFiles: [] });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Mengirim..." : "Kirim Cerita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StoryPage;

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { StoryCard, Story } from "@/components/StoryCard";
import { StoryDetailModal } from "@/components/StoryDetailModal";
import { PenLine, Loader2, X, Upload, Image, Calendar, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Extend Story type untuk include counts
interface StoryWithCounts extends Story {
  likes_count?: number;
  comments_count?: number;
}

const StoryPage = () => {
  const [stories, setStories] = useState<StoryWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoryWithCounts | null>(null);

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
          story_date: story.story_date,
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

        // Fetch likes dan comments counts untuk setiap story
        const storiesWithCounts = await Promise.all(
          formattedStories.map(async (story) => {
            const [likesResult, commentsResult] = await Promise.all([
              supabase
                .from("story_likes")
                .select("*", { count: "exact", head: true })
                .eq("story_id", story.id),
              supabase
                .from("story_comments")
                .select("*", { count: "exact", head: true })
                .eq("story_id", story.id),
            ]);

            return {
              ...story,
              likes_count: likesResult.count || 0,
              comments_count: commentsResult.count || 0,
            };
          })
        );

        setStories(storiesWithCounts);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Gagal memuat cerita. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Refresh counts setelah modal ditutup
  const handleCloseModal = async () => {
    if (selectedStory) {
      // Update counts untuk story yang baru saja dilihat
      const [likesResult, commentsResult] = await Promise.all([
        supabase
          .from("story_likes")
          .select("*", { count: "exact", head: true })
          .eq("story_id", selectedStory.id),
        supabase
          .from("story_comments")
          .select("*", { count: "exact", head: true })
          .eq("story_id", selectedStory.id),
      ]);

      setStories((prevStories) =>
        prevStories.map((s) =>
          s.id === selectedStory.id
            ? {
                ...s,
                likes_count: likesResult.count || 0,
                comments_count: commentsResult.count || 0,
              }
            : s
        )
      );
    }
    setSelectedStory(null);
  };

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
        const formattedStory: StoryWithCounts = {
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
          likes_count: 0,
          comments_count: 0,
        };
        
        // Sort stories berdasarkan story_date (descending)
        const updatedStories = [...stories, formattedStory].sort((a, b) => {
          const dateA = a.story_date ? new Date(a.story_date).getTime() : 0;
          const dateB = b.story_date ? new Date(b.story_date).getTime() : 0;
          return dateB - dateA;
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
            <div className="max-w-6xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line - Always Center */}
                <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>
                
                {stories.map((story, index) => {
                  // Parse date untuk display yang lebih besar
                  const storyDate = story.story_date ? new Date(story.story_date) : null;
                  const day = storyDate ? storyDate.getDate() : null;
                  const month = storyDate ? storyDate.toLocaleDateString('id-ID', { month: 'short' }) : null;
                  const year = storyDate ? storyDate.getFullYear() : null;
                  
                  return (
                  <div
                    key={story.id}
                    className={`relative flex items-stretch pb-16 animate-fade-up ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline Date Badge - Center */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
                      {storyDate ? (
                        <div className="bg-primary text-primary-foreground rounded-xl px-4 py-2 shadow-lg text-center min-w-[80px]">
                          <div className="text-2xl font-bold leading-none">{day}</div>
                          <div className="text-xs uppercase tracking-wide mt-1">{month}</div>
                          <div className="text-xs opacity-80">{year}</div>
                        </div>
                      ) : (
                        <div className="bg-muted text-muted-foreground rounded-xl px-4 py-2 shadow-lg text-center">
                          <Calendar className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-xs">Tanggal<br/>tidak diketahui</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Image Side - Clickable */}
                    <div 
                      className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'} pt-20 cursor-pointer`}
                      onClick={() => setSelectedStory(story)}
                    >
                      {story.story_images && story.story_images.length > 0 ? (
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg group">
                          <img
                            src={story.story_images[0]}
                            alt={`Foto kenangan dari ${story.author}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                              Lihat Detail
                            </span>
                          </div>
                          {story.story_images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              +{story.story_images.length - 1} foto lainnya
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group hover:from-primary/30 hover:to-primary/10 transition-colors">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-3xl font-serif text-primary">
                                {story.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Klik untuk detail</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Side - Nama, Cerita - Clickable */}
                    <div 
                      className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'} pt-20 cursor-pointer`}
                      onClick={() => setSelectedStory(story)}
                    >
                      <div className="bg-card rounded-xl p-6 shadow-lg border h-full hover:shadow-xl transition-shadow">
                        {/* Author Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                            {story.author_image ? (
                              <img src={story.author_image} alt={story.author} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-serif text-primary">
                                {story.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif font-semibold text-foreground text-lg">
                              {story.author}
                            </h4>
                          </div>
                        </div>
                        
                        {/* Story Content */}
                        <p className="font-body text-foreground/90 leading-relaxed line-clamp-6">
                          {story.content}
                        </p>
                        
                        {/* Action Icons with Counts */}
                        <div className="mt-4 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                              <Heart className="w-5 h-5" />
                              <span className="text-sm font-medium">{story.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{story.comments_count || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <span>Detail</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
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

      {/* Story Detail Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </div>
  );
};

export default StoryPage;

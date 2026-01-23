import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { StoryCard, Story } from "@/components/StoryCard";
import { StoryDetailModal } from "@/components/StoryDetailModal";
import { PenLine, Loader2, X, Upload, Image, Calendar, Heart, MessageCircle, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Extend Story type untuk include counts
interface StoryWithCounts extends Story {
  likes_count?: number;
  comments_count?: number;
}

interface Memorial {
  id: string;
  name: string;
}

const MemorialStory = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [stories, setStories] = useState<StoryWithCounts[]>([]);
  const [loadingMemorial, setLoadingMemorial] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoryWithCounts | null>(null);

  // Form states
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
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [likingStory, setLikingStory] = useState<string | null>(null);

  // Generate device ID untuk tracking likes
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  // Check liked stories from localStorage on mount
  useEffect(() => {
    const storedLikedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");
    setLikedStories(new Set(storedLikedStories));
  }, []);

  // Fetch memorial first
  useEffect(() => {
    if (slug) {
      fetchMemorial();
    }
  }, [slug]);

  // Fetch stories after memorial is loaded
  useEffect(() => {
    if (memorial?.id) {
      fetchStories();
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

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("memorial_id", memorial!.id)
        .order("story_date", { ascending: false });

      if (error) {
        throw error;
      }

      // Format tanggal untuk display
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

      // Fetch likes dan comments counts
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
    } finally {
      setLoading(false);
    }
  };

  // Handle like story
  const handleLikeStory = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation(); // Prevent opening modal
    
    if (likingStory === storyId) return; // Prevent double click
    
    setLikingStory(storyId);
    const deviceId = getDeviceId();
    const storedLikedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");
    const storyIdStr = String(storyId);
    const isCurrentlyLiked = likedStories.has(storyIdStr);

    try {
      if (isCurrentlyLiked) {
        // Unlike - hapus dari database
        const { error } = await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", storyId)
          .eq("user_identifier", deviceId);

        if (!error) {
          // Update localStorage
          const newStoredLikedStories = storedLikedStories.filter((id: string) => id !== storyIdStr);
          localStorage.setItem("likedStories", JSON.stringify(newStoredLikedStories));
          
          // Update state
          setLikedStories(prev => {
            const newSet = new Set(prev);
            newSet.delete(storyIdStr);
            return newSet;
          });
          setStories(prevStories =>
            prevStories.map(s =>
              s.id === storyId
                ? { ...s, likes_count: Math.max(0, (s.likes_count || 0) - 1) }
                : s
            )
          );
        }
      } else {
        // Like - tambah ke database
        const { error } = await supabase
          .from("story_likes")
          .insert([{ story_id: storyId, user_identifier: deviceId }]);

        if (!error) {
          // Update localStorage
          storedLikedStories.push(storyIdStr);
          localStorage.setItem("likedStories", JSON.stringify(storedLikedStories));
          
          // Update state
          setLikedStories(prev => new Set(prev).add(storyIdStr));
          setStories(prevStories =>
            prevStories.map(s =>
              s.id === storyId
                ? { ...s, likes_count: (s.likes_count || 0) + 1 }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikingStory(null);
    }
  };

  // Refresh counts setelah modal ditutup
  const handleCloseModal = async () => {
    if (selectedStory) {
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

  // Handle submit story
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
            memorial_id: memorial!.id,
          },
        ])
        .select();

      if (error) throw error;

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

  // Handle story images
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
    const fileName = `${memorial!.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  if (loadingMemorial) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Memuat story...</span>
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
            title={`Cerita Tentang ${memorial.name}`}
            subtitle={`Kenangan dan kisah dari orang-orang yang pernah mengenal dan mencintai ${memorial.name}`}
          />
        </div>
      </section>

      {/* Stories Timeline */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat cerita...</span>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">Belum ada cerita yang dibagikan.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm"
              >
                <PenLine className="w-4 h-4" />
                Jadilah yang Pertama Bercerita
              </button>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline Line - Left on mobile, Center on desktop */}
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>
                
                {stories.map((story, index) => {
                  const storyDate = story.story_date ? new Date(story.story_date) : null;
                  const day = storyDate ? storyDate.getDate() : null;
                  const month = storyDate ? storyDate.toLocaleDateString('id-ID', { month: 'long' }) : null;
                  const year = storyDate ? storyDate.getFullYear() : null;
                  
                  // Format created_at date
                  const createdDate = story.created_at 
                    ? new Date(story.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    : null;
                  
                  const isEven = index % 2 === 0;
                  
                  return (
                    <div
                      key={story.id}
                      className="relative pb-12 lg:pb-16 animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Timeline Dot - Left on mobile, Center on desktop */}
                      <div className="absolute left-0 lg:left-1/2 -translate-x-1/2 top-3 z-10">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-primary border-4 border-background shadow-md"></div>
                      </div>
                      
                      {/* Date Badge - Center on mobile, Above dot on desktop */}
                      <div className="flex justify-center mb-4 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-0 lg:mb-0 lg:z-20">
                        {storyDate ? (
                          <div className="bg-primary text-primary-foreground rounded-full shadow-lg flex items-center gap-1.5 px-4 py-2">
                            <span className="text-sm lg:text-base font-bold">{day}</span>
                            <span className="text-xs lg:text-sm">{month}</span>
                            <span className="text-xs lg:text-sm opacity-80">{year}</span>
                          </div>
                        ) : (
                          <div className="bg-muted text-muted-foreground rounded-full shadow-lg flex items-center gap-1.5 px-4 py-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs lg:text-sm">Tanggal tidak diketahui</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Layout - Stacked */}
                      <div className="lg:hidden pl-6">
                        <div 
                          className="bg-card rounded-xl shadow-lg border overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                          onClick={() => setSelectedStory(story)}
                        >
                          {/* Image - Top */}
                          {story.story_images && story.story_images.length > 0 ? (
                            <div className="relative aspect-video group">
                              <img
                                src={story.story_images[0]}
                                alt={`Foto kenangan dari ${story.author}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                              {story.story_images.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                  +{story.story_images.length - 1} foto lainnya
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group hover:from-primary/30 hover:to-primary/10 transition-colors">
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl font-serif text-primary">
                                  {story.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Content - Bottom */}
                          <div className="p-4">
                            {/* Author Info */}
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 flex-shrink-0">
                                {story.author_image ? (
                                  <img src={story.author_image} alt={story.author} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-serif text-primary">
                                    {story.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-serif font-semibold text-foreground">
                                  {story.author}
                                </h4>
                                {createdDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Ditulis pada {createdDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Story Content */}
                            <p className="font-body text-foreground/90 text-sm leading-relaxed line-clamp-4">
                              {story.content}
                            </p>
                            
                            {/* Action Icons with Counts */}
                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => handleLikeStory(e, String(story.id))}
                                  disabled={likingStory === String(story.id)}
                                  className={`flex items-center gap-1 transition-colors ${
                                    likedStories.has(String(story.id)) 
                                      ? 'text-red-500' 
                                      : 'text-muted-foreground hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${likedStories.has(String(story.id)) ? 'fill-current' : ''}`} />
                                  <span className="text-xs font-medium">{story.likes_count || 0}</span>
                                </button>
                                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">{story.comments_count || 0}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-primary text-xs font-medium">
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Layout - Side by Side */}
                      <div className="hidden lg:flex items-stretch pt-14 flex-row">
                        {/* Image Side */}
                        <div
                          className="w-1/2 pr-8 cursor-pointer"
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
                        
                        {/* Content Side */}
                        <div
                          className="w-1/2 pl-8 cursor-pointer"
                          onClick={() => setSelectedStory(story)}
                        >
                          <div className="bg-card rounded-xl p-6 shadow-lg border h-full hover:shadow-xl transition-shadow">
                            {/* Author Info */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 flex-shrink-0">
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
                                {createdDate && (
                                  <p className="text-sm text-muted-foreground">
                                    Ditulis pada {createdDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Story Content */}
                            <p className="font-body text-foreground/90 leading-relaxed line-clamp-6">
                              {story.content}
                            </p>
                            
                            {/* Action Icons with Counts */}
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={(e) => handleLikeStory(e, String(story.id))}
                                  disabled={likingStory === String(story.id)}
                                  className={`flex items-center gap-1.5 transition-colors ${
                                    likedStories.has(String(story.id)) 
                                      ? 'text-red-500' 
                                      : 'text-muted-foreground hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-5 h-5 ${likedStories.has(String(story.id)) ? 'fill-current' : ''}`} />
                                  <span className="text-sm font-medium">{story.likes_count || 0}</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                                  <MessageCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">{story.comments_count || 0}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Story Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm"
                >
                  <PenLine className="w-4 h-4" />
                  Bagikan Cerita Anda
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Story Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
              <h3 className="font-serif text-xl font-semibold">Bagikan Cerita Anda</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewStory({ author: "", content: "", storyDate: "", authorImageFile: null, storyImageFiles: [] });
                  setAuthorImagePreview(null);
                  setStoryImagePreviews([]);
                }}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitStory} className="p-4 space-y-4">
              {/* Author Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nama Anda *</label>
                <input
                  type="text"
                  value={newStory.author}
                  onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Author Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto Profil (opsional)</label>
                {authorImagePreview ? (
                  <div className="relative w-20 h-20">
                    <img
                      src={authorImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAuthorImagePreview(null);
                        setNewStory({ ...newStory, authorImageFile: null });
                      }}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors w-fit">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAuthorImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Story Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Kenangan (opsional)</label>
                <input
                  type="date"
                  value={newStory.storyDate}
                  onChange={(e) => setNewStory({ ...newStory, storyDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Story Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Cerita Anda *</label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0);
                    if (words.length <= 200 || e.target.value.length < newStory.content.length) {
                      setNewStory({ ...newStory, content: e.target.value });
                    }
                  }}
                  placeholder={`Ceritakan kenangan Anda bersama ${memorial.name}...`}
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">Maksimal 200 kata</p>
                  <p className={`text-xs ${newStory.content.trim().split(/\s+/).filter(w => w.length > 0).length >= 180 ? 'text-orange-500' : 'text-muted-foreground'} ${newStory.content.trim().split(/\s+/).filter(w => w.length > 0).length >= 200 ? 'text-red-500 font-medium' : ''}`}>
                    {newStory.content.trim() ? newStory.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0}/200 kata
                  </p>
                </div>
              </div>

              {/* Story Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto Pendukung (opsional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {storyImagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeStoryImage(index)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <Image className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Tambah</span>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !newStory.author.trim() || !newStory.content.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Cerita"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </div>
  );
};

export default MemorialStory;

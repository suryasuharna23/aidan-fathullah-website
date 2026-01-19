import { useState, useEffect } from "react";
import { X, Heart, Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: string;
  story_id: string | number;
  author: string;
  content: string;
  created_at: string;
}

interface StoryDetailModalProps {
  story: {
    id: string | number;
    author: string;
    content: string;
    date?: string;
    story_date?: string;
    author_image?: string;
    story_images?: string[];
    created_at?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const StoryDetailModal = ({ story, isOpen, onClose }: StoryDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ author: "", content: "" });
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // Fetch likes dan comments saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchLikes();
      fetchComments();
      checkIfLiked();
    }
  }, [isOpen, story.id]);

  // Fetch jumlah likes
  const fetchLikes = async () => {
    const { count } = await supabase
      .from("story_likes")
      .select("*", { count: "exact", head: true })
      .eq("story_id", story.id);
    
    setLikes(count || 0);
  };

  // Check apakah user sudah like (berdasarkan localStorage)
  const checkIfLiked = () => {
    const likedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");
    setIsLiked(likedStories.includes(story.id));
  };

  // Fetch comments
  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from("story_comments")
      .select("*")
      .eq("story_id", story.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
    setLoadingComments(false);
  };

  // Handle like
  const handleLike = async () => {
    if (likingInProgress) return;
    
    setLikingInProgress(true);
    const likedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");

    if (isLiked) {
      // Unlike
      await supabase
        .from("story_likes")
        .delete()
        .eq("story_id", story.id)
        .eq("user_identifier", getDeviceId());

      const newLikedStories = likedStories.filter((id: string | number) => id !== story.id);
      localStorage.setItem("likedStories", JSON.stringify(newLikedStories));
      setIsLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
    } else {
      // Like
      await supabase
        .from("story_likes")
        .insert([{ story_id: story.id, user_identifier: getDeviceId() }]);

      likedStories.push(story.id);
      localStorage.setItem("likedStories", JSON.stringify(likedStories));
      setIsLiked(true);
      setLikes((prev) => prev + 1);
    }
    setLikingInProgress(false);
  };

  // Generate device ID untuk tracking likes
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) return;

    setSubmittingComment(true);
    const { data, error } = await supabase
      .from("story_comments")
      .insert([
        {
          story_id: story.id,
          author: newComment.author,
          content: newComment.content,
        },
      ])
      .select();

    if (!error && data) {
      setComments([...comments, data[0]]);
      setNewComment({ author: "", content: "" });
    }
    setSubmittingComment(false);
  };

  // Image navigation
  const nextImage = () => {
    if (story.story_images) {
      setCurrentImageIndex((prev) =>
        prev === story.story_images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (story.story_images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? story.story_images!.length - 1 : prev - 1
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Images */}
        <div className="md:w-1/2 bg-black relative">
          {story.story_images && story.story_images.length > 0 ? (
            <div className="relative aspect-square md:h-full">
              <img
                src={story.story_images[currentImageIndex]}
                alt={`Foto ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation */}
              {story.story_images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {story.story_images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white w-4"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-square md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-serif text-primary">
                    {story.author.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <p className="text-muted-foreground">Tidak ada foto</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Content & Comments */}
        <div className="md:w-1/2 flex flex-col max-h-[90vh] md:max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {story.author_image ? (
                  <img src={story.author_image} alt={story.author} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-serif text-primary">
                    {story.author.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{story.author}</h4>
                {story.story_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(story.story_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Content */}
          <div className="p-4 border-b">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {story.content}
            </p>
          </div>

          {/* Like Button */}
          <div className="flex items-center gap-4 p-4 border-b">
            <button
              onClick={handleLike}
              disabled={likingInProgress}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{likes}</span>
            </button>
            <span className="text-sm text-muted-foreground">
              {likes} orang menyukai cerita ini
            </span>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Komentar ({comments.length})
            </h5>
            
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {comment.author.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="font-medium text-sm">{comment.author}</p>
                      <p className="text-sm text-foreground/80">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="p-4 border-t bg-muted/30">
            <div className="space-y-3">
              <input
                type="text"
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                placeholder="Nama Anda"
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment.content}
                  onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                  placeholder="Tulis komentar..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
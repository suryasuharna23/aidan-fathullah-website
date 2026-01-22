import { useState, useEffect } from "react";
import { X, Heart, Send, Loader2, MessageCircle } from "lucide-react";
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
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ author: "", content: "" });
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);

  // Generate device ID untuk tracking likes
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

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
    try {
      const { count } = await supabase
        .from("story_likes")
        .select("*", { count: "exact", head: true })
        .eq("story_id", story.id);
      
      setLikes(count || 0);
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };

  // Check apakah user sudah like
  const checkIfLiked = () => {
    const likedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");
    setIsLiked(likedStories.includes(String(story.id)));
  };

  // Fetch comments
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("story_comments")
        .select("*")
        .eq("story_id", story.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
    setLoadingComments(false);
  };

  // Handle like
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (likingInProgress) return;
    
    setLikingInProgress(true);
    const deviceId = getDeviceId();
    const likedStories = JSON.parse(localStorage.getItem("likedStories") || "[]");
    const storyIdStr = String(story.id);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", story.id)
          .eq("user_identifier", deviceId);

        if (!error) {
          const newLikedStories = likedStories.filter((id: string) => id !== storyIdStr);
          localStorage.setItem("likedStories", JSON.stringify(newLikedStories));
          setIsLiked(false);
          setLikes((prev) => Math.max(0, prev - 1));
        }
      } else {
        const { error } = await supabase
          .from("story_likes")
          .insert([{ story_id: story.id, user_identifier: deviceId }]);

        if (!error) {
          likedStories.push(storyIdStr);
          localStorage.setItem("likedStories", JSON.stringify(likedStories));
          setIsLiked(true);
          setLikes((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
    setLikingInProgress(false);
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) return;

    setSubmittingComment(true);
    try {
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
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
    setSubmittingComment(false);
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
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-xl shadow-2xl max-w-2xl w-full h-full max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* === HEADER (Sticky Top) === */}
        <div className="flex items-center justify-between p-4 border-b bg-background z-10 rounded-t-xl shrink-0">
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

        {/* === SCROLLABLE CONTENT === */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Images Stack */}
          <div className="w-full bg-muted/20">
            {story.story_images && story.story_images.length > 0 ? (
              <div className="flex flex-col gap-2 p-0">
                {story.story_images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-auto object-cover max-h-[500px]"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                   <p className="text-muted-foreground text-sm">Tidak ada foto</p>
                </div>
              </div>
            )}
          </div>

          {/* Story Content */}
          <div className="p-5">
             <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px]">
              {story.content}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-6 px-5 pb-4 border-b">
            <button
              type="button"
              onClick={handleLike}
              disabled={likingInProgress}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isLiked 
                  ? "text-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              } ${likingInProgress ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Heart 
                className={`w-6 h-6 transition-transform duration-200 ${
                  isLiked ? "fill-current scale-110" : "hover:scale-110"
                }`} 
              />
              <span className="font-medium">{likes}</span>
            </button>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{comments.length}</span>
            </div>
          </div>

          {/* Comments List */}
          <div className="p-5 space-y-4 mb-2">
            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Komentar
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
                <div key={comment.id} className="flex flex-col">
                  {/* MODIFIKASI: Profile circle dihapus, langsung bubble text */}
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-semibold text-sm mb-1 text-primary">{comment.author}</p>
                    <p className="text-sm text-foreground/80">{comment.content}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-2">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === COMMENT FORM (Sticky Bottom) === */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t bg-background shrink-0 rounded-b-xl z-10">
          <div className="space-y-3">
            <input
              type="text"
              value={newComment.author}
              onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
              placeholder="Nama Anda"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                placeholder="Tulis komentar..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
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
  );
};
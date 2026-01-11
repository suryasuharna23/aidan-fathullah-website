import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { StoryCard, Story } from "@/components/StoryCard";
import { PenLine, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const StoryPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tambahkan state untuk form
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ author: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch stories dari Supabase
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("stories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Format tanggal untuk display
        const formattedStories = data?.map((story) => ({
          ...story,
          date: story.date
            ? new Date(story.date).toLocaleDateString("id-ID", {
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
      const { data, error } = await supabase
        .from("stories")
        .insert([
          {
            author: newStory.author,
            content: newStory.content,
          },
        ])
        .select();

      if (error) throw error;

      // Tambahkan ke list stories
      if (data) {
        const formattedStory = {
          ...data[0],
          date: new Date(data[0].date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
        setStories([formattedStory, ...stories]);
      }

      // Reset form
      setNewStory({ author: "", content: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting story:", err);
      alert("Gagal mengirim cerita. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
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

      {/* Stories Grid */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StoryCard story={story} />
                </div>
              ))}
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
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitStory} className="p-4 space-y-4">
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
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

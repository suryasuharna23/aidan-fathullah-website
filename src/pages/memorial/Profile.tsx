import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { supabase } from "@/lib/supabaseClient";
import { Heart, Coffee, BookOpen, Music, MapPin, Calendar, Star, Loader2, AlertCircle } from "lucide-react";

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
}

const likeIcons = [Coffee, BookOpen, Music, Heart];

const MemorialProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchMemorial();
    }
  }, [slug]);

  const fetchMemorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("memorials")
        .select("*")
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
      setLoading(false);
    }
  };

  const formatDateRange = () => {
    if (!memorial) return null;
    const birthYear = memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : null;
    const deathYear = memorial.death_date ? new Date(memorial.death_date).getFullYear() : null;
    
    if (birthYear && deathYear) return `${birthYear} - ${deathYear}`;
    if (birthYear) return `${birthYear} - Sekarang`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Memuat memorial...</span>
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

      {/* Hero Section */}
      <section className="relative pt-16 md:pt-20">
        <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
          {memorial.cover_image || memorial.profile_image ? (
            <img
              src={memorial.cover_image || memorial.profile_image || ""}
              alt={memorial.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 animate-fade-up">
                Mengenang <span className="text-gradient">{memorial.name}</span>
              </h1>
              <p className="font-sans text-lg md:text-xl text-foreground/80 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Sebuah ruang untuk mengenang sosok yang penuh inspirasi, kebaikan, dan cinta kasih yang tak terlupakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 memorial-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={`Tentang ${memorial.name}`}
            subtitle="Mengenal lebih dekat sosok yang selalu dirindukan"
          />

          <div className="max-w-4xl mx-auto">
            <div className="card-gradient rounded-2xl p-6 md:p-10 shadow-warm">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {memorial.profile_image && (
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-blue-400 shadow-soft flex-shrink-0">
                    <img
                      src={memorial.profile_image}
                      alt={memorial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-sans text-2xl md:text-3xl font-semibold text-foreground mb-4">
                    Perkenalan
                  </h3>
                  <p className="font-sans text-foreground/85 leading-relaxed mb-6">
                    {memorial.bio || `${memorial.name} adalah sosok yang penuh kehangatan dan kebijaksanaan. Dikenal sebagai pendengar yang baik dan teman yang setia.`}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {formatDateRange() && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateRange()}
                      </span>
                    )}
                    {memorial.birth_place && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {memorial.birth_place}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Likes Section */}
      {memorial.likes && memorial.likes.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionTitle
              title="Hal yang Disukai"
              subtitle="Kebahagiaan sederhana yang membuat hari-harinya berarti"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {memorial.likes.map((item, index) => {
                const Icon = likeIcons[index % likeIcons.length];
                return (
                  <div
                    key={index}
                    className="card-gradient rounded-xl p-6 shadow-card hover:shadow-warm transition-all duration-500 group text-center"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <p className="font-sans text-foreground font-medium">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dislikes Section */}
      {memorial.dislikes && memorial.dislikes.length > 0 && (
        <section className="py-16 md:py-24 memorial-gradient">
          <div className="container mx-auto px-4">
            <SectionTitle
              title="Hal yang Tidak Disukai"
              subtitle="Prinsip hidup yang dipegang teguh"
            />

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {memorial.dislikes.map((item, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 rounded-full bg-card border border-border text-foreground/80 font-sans text-sm hover:bg-muted transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote Section */}
      {memorial.quote && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Star className="w-12 h-12 text-accent mx-auto mb-6 opacity-60" />
              <blockquote className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground italic mb-6 leading-relaxed">
                "{memorial.quote}"
              </blockquote>
              {memorial.quote_author && (
                <p className="font-sans text-muted-foreground">— {memorial.quote_author}</p>
              )}
              <Heart className="w-6 h-6 text-accent mx-auto mt-8 fill-accent opacity-60" />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MemorialProfile;

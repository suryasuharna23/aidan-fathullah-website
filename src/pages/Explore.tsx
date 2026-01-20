import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Loader2, 
  Heart,
  User,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Memorial {
  id: string;
  slug: string;
  name: string;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  bio: string | null;
  profile_image: string | null;
  cover_image: string | null;
}

const Explore = () => {
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemorials();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMemorials(memorials);
    } else {
      const filtered = memorials.filter((memorial) =>
        memorial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memorial.birth_place?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memorial.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMemorials(filtered);
    }
  }, [searchQuery, memorials]);

  const fetchMemorials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("memorials")
        .select("id, slug, name, birth_date, death_date, birth_place, bio, profile_image, cover_image")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMemorials(data || []);
      setFilteredMemorials(data || []);
    } catch (error) {
      console.error("Error fetching memorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getYearRange = (birth: string | null, death: string | null) => {
    const birthYear = birth ? new Date(birth).getFullYear() : null;
    const deathYear = death ? new Date(death).getFullYear() : null;
    
    if (birthYear && deathYear) return `${birthYear} - ${deathYear}`;
    if (birthYear) return `${birthYear} - Sekarang`;
    return null;
  };

  const handleMemorialClick = (slug: string) => {
    navigate(`/memorial/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Jelajahi Memorial</span>
            </div>
            
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Temukan & Kenang{" "}
              <span className="text-gradient">Orang Tersayang</span>
            </h1>
            
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Cari dan temukan memorial orang-orang yang dikenang. Setiap kisah adalah peninggalan yang berharga.
            </p>

            {/* Search Box */}
            <div className="max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-border focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memorials Grid Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Memuat memorial...</span>
            </div>
          ) : filteredMemorials.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "Tidak Ditemukan" : "Belum Ada Memorial"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery 
                  ? `Tidak ada memorial yang cocok dengan pencarian "${searchQuery}"`
                  : "Belum ada memorial yang dibuat. Daftar sebagai admin untuk membuat memorial pertama."
                }
              </p>
              {!searchQuery && (
                <Link
                  to="/admin/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
                >
                  <User className="w-5 h-5" />
                  Daftar Sekarang
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  Menampilkan <span className="font-medium text-foreground">{filteredMemorials.length}</span> memorial
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMemorials.map((memorial) => (
                  <div
                    key={memorial.id}
                    onClick={() => handleMemorialClick(memorial.slug)}
                    className="group cursor-pointer card-gradient rounded-2xl overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Cover/Profile Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {memorial.cover_image || memorial.profile_image ? (
                        <img
                          src={memorial.cover_image || memorial.profile_image || ""}
                          alt={memorial.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Profile Image Overlay */}
                      {memorial.profile_image && memorial.cover_image && (
                        <div className="absolute bottom-4 left-4">
                          <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden">
                            <img
                              src={memorial.profile_image}
                              alt={memorial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-sans text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {memorial.name}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        {getYearRange(memorial.birth_date, memorial.death_date) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{getYearRange(memorial.birth_date, memorial.death_date)}</span>
                          </div>
                        )}
                        
                        {memorial.birth_place && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{memorial.birth_place}</span>
                          </div>
                        )}
                      </div>

                      {memorial.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {memorial.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        <span>Lihat Memorial</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 memorial-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ingin Membuat Memorial?
            </h2>
            <p className="text-muted-foreground mb-6">
              Daftarkan diri Anda sebagai admin untuk membuat dan mengelola memorial orang tersayang.
            </p>
            <Link
              to="/admin/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-warm"
            >
              <User className="w-5 h-5" />
              Daftar Sebagai Admin
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Explore;

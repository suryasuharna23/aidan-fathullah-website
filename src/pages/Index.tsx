import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { Heart, Coffee, BookOpen, Music, MapPin, Calendar, Star } from "lucide-react";
import heroPortrait from "@/assets/hero-potrait.jpg";

const Index = () => {
  const likes = [
    { icon: Coffee, text: "Kopi di pagi hari" },
    { icon: BookOpen, text: "Membaca buku" },
    { icon: Music, text: "Mendengarkan musik" },
    { icon: MapPin, text: "Jalan-jalan alam" },
  ];

  const dislikes = [
    "Ketidakjujuran",
    "Kebisingan berlebihan",
    "Makanan terlalu pedas",
    "Kemacetan",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24">
        <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
          <img
            src={heroPortrait}
            alt="Mas Idan"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 animate-fade-up">
                Mengenang <span className="text-gradient">Mas Idan</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-foreground/80 max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
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
            title="Tentang Mas Idan"
            subtitle="Mengenal lebih dekat sosok yang selalu dirindukan"
          />

          <div className="max-w-4xl mx-auto">
            <div className="card-gradient rounded-2xl p-6 md:p-10 shadow-warm">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-warm-sepia shadow-soft flex-shrink-0">
                  <img
                    src={heroPortrait}
                    alt="Mas Idan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                    Perkenalan
                  </h3>
                  <p className="font-body text-foreground/85 leading-relaxed mb-6">
                    Mas Idan adalah sosok yang penuh kehangatan dan kebijaksanaan. Lahir di tanah Jawa yang subur, 
                    beliau tumbuh menjadi pribadi yang rendah hati namun penuh inspirasi. Dengan senyum yang selalu 
                    menghiasi wajahnya, Mas Idan dikenal sebagai pendengar yang baik dan teman yang setia.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      1990 - 2024
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      Jawa, Indonesia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionTitle
              title="Latar Belakang"
              subtitle="Perjalanan hidup yang penuh makna"
            />

            <div className="prose prose-lg max-w-none">
              <p className="font-body text-foreground/85 leading-relaxed text-center">
                Mas Idan menyelesaikan pendidikannya di salah satu universitas terkemuka di Indonesia. 
                Selama hidupnya, beliau mengabdikan diri untuk keluarga dan masyarakat sekitar. 
                Dikenal sebagai sosok yang selalu siap membantu siapa saja yang membutuhkan, 
                Mas Idan meninggalkan jejak kebaikan yang tak akan pernah terlupakan oleh orang-orang 
                yang pernah mengenalnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Likes Section */}
      <section className="py-16 md:py-24 memorial-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Hal yang Disukai"
            subtitle="Kebahagiaan sederhana yang membuat hari-harinya berarti"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {likes.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="card-gradient rounded-xl p-6 shadow-card hover:shadow-warm transition-all duration-500 group text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-body text-foreground font-medium">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dislikes Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Hal yang Tidak Disukai"
            subtitle="Prinsip hidup yang dipegang teguh"
          />

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {dislikes.map((item, index) => (
              <span
                key={index}
                className="px-5 py-2.5 rounded-full bg-card border border-border text-foreground/80 font-body text-sm hover:bg-muted transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-24 memorial-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-12 h-12 text-accent mx-auto mb-6 opacity-60" />
            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground italic mb-6 leading-relaxed">
              "Kebaikan yang kita taburkan akan tumbuh menjadi kenangan indah di hati orang lain."
            </blockquote>
            <p className="font-body text-muted-foreground">— Mas Idan</p>
            <Heart className="w-6 h-6 text-accent mx-auto mt-8 fill-accent opacity-60" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

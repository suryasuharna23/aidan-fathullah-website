import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { Link } from "react-router-dom";
import { 
  Image, 
  Clock, 
  User, 
  Heart, 
  MessageCircle, 
  Upload, 
  Shield, 
  Sparkles,
  ArrowRight,
  Camera,
  Video,
  BookOpen,
  Users,
  Star,
  Search
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Explore Memorial",
    description: "Temukan dan jelajahi memorial orang-orang tersayang. Cari berdasarkan nama atau lokasi dan kenang mereka dengan penuh cinta.",
    link: "/explore",
    linkText: "Jelajahi Sekarang",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: User,
    title: "Buat Memorial",
    description: "Daftarkan diri sebagai admin untuk membuat memorial orang tersayang. Kelola profil, galeri, dan cerita dengan mudah.",
    link: "/admin/register",
    linkText: "Daftar Sekarang",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Heart,
    title: "Berbagi Kenangan",
    description: "Bagikan cerita dan kenangan Anda. Berikan like dan komentar pada story yang menyentuh hati.",
    link: "/explore",
    linkText: "Mulai Berbagi",
    color: "from-orange-500 to-red-500"
  },
];

const memorialFeatures = [
  {
    icon: User,
    title: "Halaman Profil",
    description: "Tampilkan biodata lengkap, latar belakang, dan hal-hal yang disukai"
  },
  {
    icon: Image,
    title: "Galeri Foto & Video",
    description: "Kumpulan momen berharga dalam foto dan video"
  },
  {
    icon: Clock,
    title: "Story Timeline",
    description: "Cerita dan kenangan dalam timeline yang indah"
  },
  {
    icon: Heart,
    title: "Sistem Like",
    description: "Berikan apresiasi pada setiap cerita"
  },
  {
    icon: MessageCircle,
    title: "Komentar",
    description: "Tinggalkan pesan dan kenangan"
  },
  {
    icon: Shield,
    title: "Admin Panel",
    description: "Kelola konten dengan aman"
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Selamat Datang di ARKUN.CO</span>
            </div>
            
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Platform Memorial{" "}
              <span className="text-gradient">Digital</span>
            </h1>
            
            <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Tempat untuk mengabadikan kenangan, berbagi cerita, dan mengenang sosok yang selalu dirindukan. Sebuah ruang digital penuh cinta dan kehangatan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-warm hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
                Jelajahi Memorial
              </Link>
              <Link
                to="/admin/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-full font-medium hover:bg-muted/80 transition-all"
              >
                <User className="w-5 h-5" />
                Buat Memorial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-16 md:py-24 memorial-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Fitur Utama"
            subtitle="Jelajahi berbagai fitur yang tersedia untuk mengabadikan kenangan"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group card-gradient rounded-2xl p-6 md:p-8 shadow-warm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="font-sans text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="font-sans text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    {feature.linkText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sub Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Fitur Setiap Memorial"
            subtitle="Setiap memorial dilengkapi dengan fitur lengkap berikut"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {memorialFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-sans font-medium text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="font-sans text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Cara Menggunakan"
            subtitle="Panduan singkat untuk memulai"
          />

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Daftar Sebagai Admin",
                  description: "Buat akun untuk mengelola memorial orang tersayang Anda"
                },
                {
                  step: "02",
                  title: "Buat Memorial",
                  description: "Lengkapi profil, upload foto, dan tambahkan cerita"
                },
                {
                  step: "03",
                  title: "Bagikan & Kenang",
                  description: "Bagikan ke keluarga dan teman untuk bersama mengenang"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h4 className="font-sans text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center card-gradient rounded-3xl p-8 md:p-12 shadow-warm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground mb-4">
              Mulai Mengabadikan Kenangan
            </h2>
            
            <p className="font-sans text-muted-foreground mb-8 max-w-xl mx-auto">
              Setiap cerita dan momen berharga layak untuk diabadikan. Buat memorial untuk orang tersayang dan bagikan kenangan bersama keluarga dan teman.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-warm"
              >
                <Search className="w-5 h-5" />
                Jelajahi Memorial
              </Link>
              <Link
                to="/admin/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-full font-medium hover:bg-primary/10 transition-all"
              >
                <Users className="w-5 h-5" />
                Daftar Sebagai Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

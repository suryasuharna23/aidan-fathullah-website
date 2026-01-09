import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Image, Video } from "lucide-react";

import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const Gallery = () => {
  const photos = [
    { src: gallery1, alt: "Moment kopi pagi", caption: "Waktu tenang di pagi hari" },
    { src: gallery2, alt: "Sunset indah", caption: "Menikmati keindahan alam" },
    { src: gallery3, alt: "Koleksi buku", caption: "Membaca adalah kebahagiaan" },
    { src: gallery4, alt: "Pemandangan sawah", caption: "Kedamaian di desa" },
    { src: gallery1, alt: "Moment kopi sore", caption: "Sore yang tenang" },
    { src: gallery2, alt: "Golden hour", caption: "Momen emas hari ini" },
  ];

  const videos = [
    {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Kenangan Bersama Mas Idan",
    },
    {
      url: "https://www.youtube.com/watch?v=L_jWHffIx5E",
      title: "Momen Kebersamaan",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 hero-gradient">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Galeri Kenangan"
            subtitle="Momen-momen berharga yang terabadikan selamanya dalam foto dan video"
          />
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="photos" className="w-full">
            <div className="flex justify-center mb-8 md:mb-12">
              <TabsList className="bg-muted p-1 rounded-full">
                <TabsTrigger
                  value="photos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Foto
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2.5 flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="photos" className="animate-fade-in">
              {/* Photo Carousel */}
              <div className="mb-12">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                  Slideshow Foto
                </h3>
                <PhotoCarousel photos={photos} />
              </div>

              {/* Photo Grid */}
              <div className="mt-16">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                  Semua Foto
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-xl shadow-card hover:shadow-warm transition-all duration-500 cursor-pointer"
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover image-sepia group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-primary-foreground font-body text-sm">
                            {photo.caption}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="animate-fade-in">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                  Video Kenangan
                </h3>
                <div className="grid gap-8">
                  {videos.map((video, index) => (
                    <VideoPlayer
                      key={index}
                      videoUrl={video.url}
                      title={video.title}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;

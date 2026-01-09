import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionTitle } from "@/components/SectionTitle";
import { StoryCard, Story } from "@/components/StoryCard";
import { PenLine } from "lucide-react";

import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

const StoryPage = () => {
  // Sample stories - these would come from a database in a real app
  const stories: Story[] = [
    {
      id: "1",
      author: "Budi Santoso",
      authorImage: "",
      storyImage: gallery1,
      content:
        "Mas Idan selalu hadir di setiap momen penting dalam hidup saya. Beliau adalah mentor yang tidak hanya mengajarkan tentang pekerjaan, tapi juga tentang kehidupan. Senyumnya yang hangat dan kata-kata bijaknya akan selalu saya ingat. Terima kasih telah menjadi bagian dari perjalanan hidup saya, Mas Idan.",
      date: "5 Januari 2024",
    },
    {
      id: "2",
      author: "Siti Aminah",
      authorImage: "",
      storyImage: gallery2,
      content:
        "Mengenal Mas Idan adalah salah satu keberuntungan terbesar dalam hidup saya. Beliau adalah sosok yang penuh kasih sayang dan selalu peduli dengan orang di sekitarnya. Setiap nasihat yang beliau berikan selalu penuh makna dan membuat saya menjadi pribadi yang lebih baik.",
      date: "3 Januari 2024",
    },
    {
      id: "3",
      author: "Ahmad Hidayat",
      authorImage: "",
      storyImage: gallery3,
      content:
        "Saya masih ingat pertama kali bertemu Mas Idan di perpustakaan. Beliau sedang membaca buku filsafat dan dengan ramah mengajak saya berdiskusi. Sejak saat itu, kami menjadi sahabat. Banyak hal yang saya pelajari dari beliau, terutama tentang pentingnya terus belajar sepanjang hayat.",
      date: "1 Januari 2024",
    },
    {
      id: "4",
      author: "Dewi Lestari",
      authorImage: "",
      content:
        "Mas Idan adalah tetangga yang luar biasa. Beliau selalu siap membantu siapa saja yang membutuhkan. Ketika saya kesulitan, beliau selalu ada dengan solusi dan semangat yang menguatkan. Kebaikan hatinya tidak akan pernah terlupakan.",
      date: "28 Desember 2023",
    },
    {
      id: "5",
      author: "Rudi Hartono",
      authorImage: "",
      storyImage: gallery1,
      content:
        "Sebagai teman seperjuangan di kampus, saya tahu betul bagaimana dedikasi Mas Idan dalam segala hal. Beliau tidak pernah setengah-setengah dalam mengerjakan sesuatu. Semangat dan integritasnya menjadi inspirasi bagi kami semua.",
      date: "25 Desember 2023",
    },
  ];

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
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-warm">
              <PenLine className="w-4 h-4" />
              Tulis Cerita
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StoryPage;

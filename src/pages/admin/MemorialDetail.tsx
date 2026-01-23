import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Image, Video, BookOpen } from "lucide-react";

interface Memorial {
  id: string;
  name: string;
  slug: string;
}

export default function AdminMemorialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMemorial();
  }, [id]);

  const fetchMemorial = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("memorials")
      .select("id, name, slug")
      .eq("id", id)
      .single();
    if (error) {
      setMemorial(null);
    } else {
      setMemorial(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat memorial...</span>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg mb-4">Memorial tidak ditemukan.</p>
        <Button asChild>
          <Link to="/admin/memorials">Kembali ke Daftar Memorial</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/admin/memorials">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-6">Kelola Memorial: {memorial.name}</h1>
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="photos">
              <Image className="w-4 h-4 mr-2" /> Foto
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" /> Video
            </TabsTrigger>
            <TabsTrigger value="stories">
              <BookOpen className="w-4 h-4 mr-2" /> Cerita
            </TabsTrigger>
          </TabsList>
          <TabsContent value="photos">
            {/* TODO: Form & list pengelolaan foto memorial ini */}
            <Card><CardHeader><CardTitle>Foto</CardTitle></CardHeader><CardContent>Pengelolaan foto memorial ini di sini.</CardContent></Card>
          </TabsContent>
          <TabsContent value="videos">
            {/* TODO: Form & list pengelolaan video memorial ini */}
            <Card><CardHeader><CardTitle>Video</CardTitle></CardHeader><CardContent>Pengelolaan video memorial ini di sini.</CardContent></Card>
          </TabsContent>
          <TabsContent value="stories">
            {/* TODO: Form & list pengelolaan cerita memorial ini */}
            <Card><CardHeader><CardTitle>Cerita</CardTitle></CardHeader><CardContent>Pengelolaan cerita memorial ini di sini.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

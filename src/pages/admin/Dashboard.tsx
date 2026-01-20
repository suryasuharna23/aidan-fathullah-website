import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image,
  Video,
  BookOpen,
  LogOut,
  User,
  Settings,
  Plus,
  Eye,
  Loader2,
  Users,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  is_public: boolean;
  created_at: string;
}

interface Stats {
  memorials: number;
  photos: number;
  videos: number;
  stories: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({ memorials: 0, photos: 0, videos: 0, stories: 0 });
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchMemorials();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [memorialsRes, photosRes, videosRes, storiesRes] = await Promise.all([
        supabase.from("memorials").select("id", { count: "exact", head: true }).eq("admin_id", user.id),
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("stories").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        memorials: memorialsRes.count || 0,
        photos: photosRes.count || 0,
        videos: videosRes.count || 0,
        stories: storiesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemorials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("admin_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setMemorials(data || []);
    } catch (error) {
      console.error("Error fetching memorials:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari panel admin",
    });
    navigate("/admin/login");
  };

  const menuItems = [
    {
      title: "Kelola Memorial",
      description: "Buat dan kelola memorial orang tersayang",
      icon: Users,
      href: "/admin/memorials",
      count: stats.memorials,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Kelola Foto",
      description: "Tambah, edit, dan hapus foto galeri",
      icon: Image,
      href: "/admin/photos",
      count: stats.photos,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Kelola Video",
      description: "Tambah, edit, dan hapus video",
      icon: Video,
      href: "/admin/videos",
      count: stats.videos,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Kelola Cerita",
      description: "Moderasi cerita dari pengunjung",
      icon: BookOpen,
      href: "/admin/stories",
      count: stats.stories,
      color: "bg-green-500/10 text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/" target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Website
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Selamat Datang, Admin! 👋
          </h1>
          <p className="text-muted-foreground">
            Kelola memorial orang-orang tersayang dari sini.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Memorial</p>
                      <p className="text-3xl font-bold">{stats.memorials}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Foto</p>
                      <p className="text-3xl font-bold">{stats.photos}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Video</p>
                      <p className="text-3xl font-bold">{stats.videos}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cerita</p>
                      <p className="text-3xl font-bold">{stats.stories}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* My Memorials Preview */}
        {memorials.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Memorial Saya</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/memorials">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {memorials.map((memorial) => (
                <Card key={memorial.id} className="overflow-hidden">
                  <div className="relative h-24 bg-muted">
                    {memorial.cover_image ? (
                      <img
                        src={memorial.cover_image}
                        alt={memorial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                    <div className="absolute -bottom-6 left-4">
                      <div className="w-12 h-12 rounded-full border-4 border-background bg-muted overflow-hidden">
                        {memorial.profile_image ? (
                          <img
                            src={memorial.profile_image}
                            alt={memorial.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <User className="w-6 h-6 text-primary/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-8 pb-4">
                    <h3 className="font-semibold">{memorial.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {memorial.birth_place && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {memorial.birth_place}
                        </span>
                      )}
                      {memorial.birth_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(memorial.birth_date).getFullYear()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/memorial/${memorial.slug}`} target="_blank">
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Menu Pengelolaan</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => (
            <Card key={item.href} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={item.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/memorials">
                <Plus className="w-4 h-4 mr-2" />
                Buat Memorial
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/photos">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Foto
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/videos">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Video
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

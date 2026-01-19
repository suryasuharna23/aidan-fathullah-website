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
  Home,
  LogOut,
  User,
  Settings,
  BarChart3,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  photos: number;
  videos: number;
  stories: number;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({ photos: 0, videos: 0, stories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [photosRes, videosRes, storiesRes] = await Promise.all([
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("stories").select("id", { count: "exact", head: true }),
      ]);

      setStats({
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
            Kelola konten website memorial Mas Idan dari sini.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
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

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Menu Pengelolaan</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <Button variant="outline" asChild>
              <Link to="/admin/stories">
                <BarChart3 className="w-4 h-4 mr-2" />
                Lihat Cerita
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Mohon isi semua field",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Daftarkan user ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          // Nonaktifkan email confirmation untuk development
          // emailRedirectTo: window.location.origin + '/admin/login',
        },
      });

      console.log("Auth signup response:", { authData, authError });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Gagal membuat akun");
      }

      // Cek apakah user perlu konfirmasi email
      // Jika identities kosong, berarti email sudah terdaftar
      if (authData.user.identities && authData.user.identities.length === 0) {
        throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
      }

      // 2. Tambahkan ke tabel admins
      const { error: adminError } = await supabase.from("admins").insert([
        {
          user_id: authData.user.id,
          email: email,
          name: name,
        },
      ]);

      console.log("Admin insert result:", { adminError });

      if (adminError) {
        console.error("Error adding to admins table:", adminError);
        // Tidak throw error, karena user sudah terdaftar di auth
        // Biarkan user mencoba login
      }

      // Cek apakah perlu konfirmasi email
      if (authData.session === null && authData.user.email_confirmed_at === null) {
        toast({
          title: "Registrasi Berhasil",
          description: "Silakan cek email Anda untuk konfirmasi akun, kemudian login.",
        });
      } else {
        toast({
          title: "Registrasi Berhasil",
          description: "Akun admin berhasil dibuat. Silakan login.",
        });
      }

      // Redirect ke halaman login
      navigate("/admin/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
      
      if (error.message?.includes("User already registered")) {
        errorMessage = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Format email tidak valid.";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "Password minimal 6 karakter.";
      } else if (error.message?.includes("Unable to validate email")) {
        errorMessage = "Email tidak valid atau tidak bisa diverifikasi.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registrasi Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 pt-20">
        <Card className="w-full max-w-md shadow-warm mt-8 md:mt-16">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daftar Admin</CardTitle>
          <CardDescription>
            Buat akun admin baru untuk mengelola website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Daftar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/admin/login" className="text-primary hover:underline font-medium">
                Login di sini
              </Link>
            </p>
            <a href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Kembali ke Website
            </a>
          </div>
        </CardContent>
        </Card>
      </div>
    </>
  );
}

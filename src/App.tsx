import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";

// Memorial pages (dynamic by slug)
import MemorialProfile from "./pages/memorial/Profile";
import MemorialGallery from "./pages/memorial/Gallery";
import MemorialStory from "./pages/memorial/Story";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminRegister from "./pages/admin/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMemorials from "./pages/admin/Memorials";
import AdminPhotos from "./pages/admin/Photos";
import AdminVideos from "./pages/admin/Videos";
import AdminStories from "./pages/admin/Stories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />

            {/* Memorial Routes (dynamic by slug) */}
            <Route path="/memorial/:slug" element={<MemorialProfile />} />
            <Route path="/memorial/:slug/gallery" element={<MemorialGallery />} />
            <Route path="/memorial/:slug/story" element={<MemorialStory />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/memorials"
              element={
                <ProtectedRoute>
                  <AdminMemorials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/photos"
              element={
                <ProtectedRoute>
                  <AdminPhotos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/videos"
              element={
                <ProtectedRoute>
                  <AdminVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stories"
              element={
                <ProtectedRoute>
                  <AdminStories />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

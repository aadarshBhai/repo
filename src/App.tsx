import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import Upload from "./pages/Upload";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import RequireAdmin from "./components/RequireAdmin";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import About from "./pages/About";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<><Navigation /><Explore /></>} />
            <Route path="/upload" element={<><Navigation /><Upload /></>} />
            <Route path="/about-us" element={<><Navigation /><About /></>} />
            <Route path="/login" element={<><Navigation /><Login /></>} />
            <Route path="/signup" element={<><Navigation /><SignUp /></>} />
            <Route path="/forgot-password" element={<><Navigation /><ForgotPassword /></>} />
            <Route path="/reset-password" element={<><Navigation /><ResetPassword /></>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="/category/:categoryName" element={<><Navigation /><Category /></>} />
            <Route path="/profile" element={<RequireAuth><><Navigation /><Profile /></></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useSharedTrip } from "@/hooks/useSharedTrip";
import PresenceIndicator from "@/components/PresenceIndicator";
import { toast } from "sonner";
import { useEffect } from "react";
import Index from "./pages/Index";
import Itinerary from "./pages/Itinerary";
import Expenses from "./pages/Expenses";
import Shopping from "./pages/Shopping";
import Translate from "./pages/Translate";
import Weather from "./pages/Weather";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SharedTripBootstrap = () => {
  const { tripId, loading } = useSharedTrip();
  useEffect(() => {
    if (tripId && !loading) {
      toast.success("已連線到共享行程", { description: "變更會即時同步給所有協作者" });
    }
  }, [tripId, loading]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SharedTripBootstrap />
        <PresenceIndicator />
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Messages from "./pages/Backoffice/Messages";
import Projects from "./pages/Backoffice/Projects";
import Catalog from "./pages/Backoffice/Catalog";
import Orders from "./pages/Backoffice/Orders";
import Availability from "./pages/Backoffice/Availability";
import Customers from "./pages/Backoffice/Customers";
import About from "./pages/Backoffice/About";
import HomeContent from "./pages/Backoffice/HomeContent";
import Categories from "./pages/Backoffice/Categories";
import OwnerProfile from "./pages/Backoffice/OwnerProfile";
import LegalPages from "./pages/Backoffice/LegalPages";
import Settings from "./pages/Backoffice/Settings";
import PromoCodes from "./pages/Backoffice/PromoCodes";
import { checkAdminSession } from "./lib/session";

function Protected({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "ko">("loading");

  useEffect(() => {
    checkAdminSession().then((session) => {
      setStatus(session ? "ok" : "ko");
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Vérification de la session…
      </div>
    );
  }
  if (status === "ko") return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Navigate to="/messages" replace />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/projects-admin" element={<Projects />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/about-content" element={<About />} />
            <Route path="/home-content" element={<HomeContent />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/owner-profile" element={<OwnerProfile />} />
            <Route path="/legal-pages" element={<LegalPages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/promo-codes" element={<PromoCodes />} />
          </Route>

          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

// Pages
import Home from "./pages/Home";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Publish from "./pages/Publish";
import Talent from "./pages/Talent";
import Resources from "./pages/Resources";
import ArticleDetail from "./pages/ArticleDetail";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="App min-h-screen bg-white text-gray-900">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oportunidades" element={<Opportunities />} />
            <Route path="/oportunidades/:slug" element={<OpportunityDetail />} />
            <Route path="/publicar" element={<Publish />} />
            <Route path="/talento" element={<Talent />} />
            <Route path="/recursos" element={<Resources />} />
            <Route path="/recursos/:slug" element={<ArticleDetail />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/precios" element={<Pricing />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
        <Toaster />
      </Router>
    </div>
  );
}

export default App;
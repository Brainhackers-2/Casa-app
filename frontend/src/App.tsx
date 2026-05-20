import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const VisitPage = lazy(() => import('./pages/VisitPage'));
const LocationDetailPage = lazy(() => import('./pages/LocationDetailPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const GastronomyPage = lazy(() => import('./pages/GastronomyPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
const AccommodationsPage = lazy(() => import('./pages/AccommodationsPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CinemaPage = lazy(() => import('./pages/CinemaPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-emerald-700 text-sm font-medium">Chargement...</p>
      </div>
    </div>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut"
      className={`fixed bottom-24 right-6 z-[60] p-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <ArrowUp size={24} />
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/discovery" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
                  <Route path="/visit" element={<ProtectedRoute><VisitPage /></ProtectedRoute>} />
                  <Route path="/visit/:id" element={<ProtectedRoute><LocationDetailPage /></ProtectedRoute>} />
                  <Route path="/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
                  <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                  <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                  <Route path="/gastronomy" element={<ProtectedRoute><GastronomyPage /></ProtectedRoute>} />
                  <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
                  <Route path="/guides" element={<ProtectedRoute><GuidesPage /></ProtectedRoute>} />
                  <Route path="/accommodations" element={<ProtectedRoute><AccommodationsPage /></ProtectedRoute>} />
                  <Route path="/testimonials" element={<ProtectedRoute><TestimonialsPage /></ProtectedRoute>} />
                  <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                  <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                  <Route path="/cinema" element={<ProtectedRoute><CinemaPage /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Chatbot />
            <ScrollToTopButton />
          </div>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

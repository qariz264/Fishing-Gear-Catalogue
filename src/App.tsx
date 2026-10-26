import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { Loader2 } from 'lucide-react';

// Core Catalogue landing page is loaded directly for instant 0ms first render
import { PublicCataloguePage } from './pages/PublicCataloguePage';

// Lazy-loaded secondary public routes to optimize initial bundle size & load speed
const PublicFishingSpotsPage = lazy(() =>
  import('./pages/PublicFishingSpotsPage').then((m) => ({ default: m.PublicFishingSpotsPage }))
);
const PublicBlogsPage = lazy(() =>
  import('./pages/PublicBlogsPage').then((m) => ({ default: m.PublicBlogsPage }))
);
const PublicBlogDetailPage = lazy(() =>
  import('./pages/PublicBlogDetailPage').then((m) => ({ default: m.PublicBlogDetailPage }))
);
const PublicEventsPage = lazy(() =>
  import('./pages/PublicEventsPage').then((m) => ({ default: m.PublicEventsPage }))
);
const PublicTrainingPage = lazy(() =>
  import('./pages/PublicTrainingPage').then((m) => ({ default: m.PublicTrainingPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded Admin dashboard pages & layout (code-split to minimize customer bundle)
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminRouteGuard = lazy(() =>
  import('./components/admin/AdminRouteGuard').then((m) => ({ default: m.AdminRouteGuard }))
);
const AdminDashboardOverview = lazy(() =>
  import('./pages/admin/AdminDashboardOverview').then((m) => ({ default: m.AdminDashboardOverview }))
);
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminBlogsPage = lazy(() =>
  import('./pages/admin/AdminBlogsPage').then((m) => ({ default: m.AdminBlogsPage }))
);
const AdminEventsPage = lazy(() =>
  import('./pages/admin/AdminEventsPage').then((m) => ({ default: m.AdminEventsPage }))
);
const AdminTrainingPage = lazy(() =>
  import('./pages/admin/AdminTrainingPage').then((m) => ({ default: m.AdminTrainingPage }))
);
const AdminFishingSpotsPage = lazy(() =>
  import('./pages/admin/AdminFishingSpotsPage').then((m) => ({ default: m.AdminFishingSpotsPage }))
);
const AdminReviewsPage = lazy(() =>
  import('./pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage }))
);
const AdminSocialSharePage = lazy(() =>
  import('./pages/admin/AdminSocialSharePage').then((m) => ({ default: m.AdminSocialSharePage }))
);

// Fast, unobtrusive fallback loader for public routes
const PublicChunkFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-slate-500">
    <Loader2 className="w-6 h-6 text-amber-600 animate-spin mb-3" />
    <span className="text-xs font-mono font-medium text-slate-500 tracking-wide">
      Loading Fishing With Nelson...
    </span>
  </div>
);

// Admin portal fallback during chunk load
const AdminChunkFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
    <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-400">
      Loading Admin Portal...
    </span>
  </div>
);

// Global Cart Drawer connected to CartContext
const GlobalCartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <CartDrawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      items={cartItems}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
    />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <CartProvider>
          <Routes>
            {/* Direct Instant Load Route */}
            <Route path="/" element={<PublicCataloguePage />} />

            {/* Code-split Public Secondary Routes with Fast Fallback */}
            <Route
              path="/fishing-spots"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <PublicFishingSpotsPage />
                </Suspense>
              }
            />
            <Route
              path="/blogs"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <PublicBlogsPage />
                </Suspense>
              }
            />
            <Route
              path="/blogs/:slug"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <PublicBlogDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/events"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <PublicEventsPage />
                </Suspense>
              }
            />
            <Route
              path="/training"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <PublicTrainingPage />
                </Suspense>
              }
            />

            {/* Admin Authentication Route (Lazy-loaded) */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminChunkFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />

            {/* Secure Admin Dashboard Routes (Lazy-loaded) */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminChunkFallback />}>
                  <AdminRouteGuard>
                    <AdminLayout />
                  </AdminRouteGuard>
                </Suspense>
              }
            >
              <Route index element={<AdminDashboardOverview />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="blogs" element={<AdminBlogsPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="training" element={<AdminTrainingPage />} />
              <Route path="fishing-spots" element={<AdminFishingSpotsPage />} />
              <Route path="social-share" element={<AdminSocialSharePage />} />
            </Route>

            {/* Dedicated 404 Route */}
            <Route
              path="*"
              element={
                <Suspense fallback={<PublicChunkFallback />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Routes>

          {/* Slide-over Cart Drawer accessible across all customer views */}
          <GlobalCartDrawer />
        </CartProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

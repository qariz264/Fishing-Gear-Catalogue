import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { Loader2 } from 'lucide-react';

// Customer-facing pages (loaded for customers)
import { PublicCataloguePage } from './pages/PublicCataloguePage';
import { PublicFishingSpotsPage } from './pages/PublicFishingSpotsPage';
import { PublicBlogsPage } from './pages/PublicBlogsPage';
import { PublicBlogDetailPage } from './pages/PublicBlogDetailPage';
import { PublicEventsPage } from './pages/PublicEventsPage';
import { PublicTrainingPage } from './pages/PublicTrainingPage';
import { NotFoundPage } from './pages/NotFoundPage';

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

// Minimalist fallback during async chunk load
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
            {/* Customer-Facing Public Routes */}
            <Route path="/" element={<PublicCataloguePage />} />
            <Route path="/fishing-spots" element={<PublicFishingSpotsPage />} />
            <Route path="/blogs" element={<PublicBlogsPage />} />
            <Route path="/blogs/:slug" element={<PublicBlogDetailPage />} />
            <Route path="/events" element={<PublicEventsPage />} />
            <Route path="/training" element={<PublicTrainingPage />} />

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
              <Route path="blogs" element={<AdminBlogsPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="training" element={<AdminTrainingPage />} />
              <Route path="fishing-spots" element={<AdminFishingSpotsPage />} />
            </Route>

            {/* Dedicated 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Slide-over Cart Drawer accessible across all customer views */}
          <GlobalCartDrawer />
        </CartProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FishingSpotItem } from '../types/admin';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  MapPin,
  Navigation,
  Shield,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Waves,
} from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';
import { setPageSeo } from '../utils/seo';

export const PublicFishingSpotsPage: React.FC = () => {
  const [spots, setSpots] = useState<FishingSpotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<FishingSpotItem | null>(null);

  useEffect(() => {
    setPageSeo({
      title: 'Kenya Fishing Spots Guide - Lakes, Rivers & Marine | Fishing With Nelson',
      description:
        'Explore verified fishing spots across Kenya including Lake Naivasha, Aberdare trout streams, and Indian Ocean coastal waters with access tips and target species.',
      canonicalPath: '/fishing-spots',
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'fishingSpots'),
      (snapshot) => {
        const list: FishingSpotItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as FishingSpotItem;
          if (data.published !== false) {
            list.push({ ...data, id: d.id });
          }
        });
        setSpots(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error reading fishing spots:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredSpots = spots.filter((spot) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      spot.name.toLowerCase().includes(q) ||
      spot.region.toLowerCase().includes(q) ||
      (spot.description || '').toLowerCase().includes(q) ||
      (spot.fishingType || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Waves className="w-4 h-4" />
            <span>Angling Destinations & Waters</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Kenya Fishing Spots Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Angling spots across Kenya: Lake Naivasha, Aberdares trout streams, Lake Victoria, and coastal waters. Includes access instructions and recommended tackle.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lake, river, county, or fish type..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading fishing spots...
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No fishing spots found</h3>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? `No spots matched "${searchQuery}". Try another keyword or browse all destinations.`
                : 'No spots are currently published. Check back soon or contact Nelson directly on WhatsApp for spot recommendations.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Spot Image */}
                  {spot.imageUrl ? (
                    <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{spot.region}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <MapPin className="w-6 h-6 text-slate-300" />
                    </div>
                  )}

                  {/* Spot Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[11px] text-cyan-800 font-semibold mb-1">
                        {spot.region}
                      </div>
                      <h2 className="text-base font-bold text-slate-950 font-display">
                        {spot.name}
                      </h2>
                    </div>

                    {spot.fishingType && (
                      <div className="inline-block bg-cyan-50 border border-cyan-200/60 text-cyan-900 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        {spot.fishingType}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {spot.description}
                    </p>

                    {spot.accessInstructions && (
                      <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-700 block">Access:</span>
                        <span className="line-clamp-2">{spot.accessInstructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedSpot(spot)}
                      className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Spot Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {spot.mapLink && (
                      <a
                        href={spot.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Open Map Coordinates"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 my-8">
            <div className="relative">
              {selectedSpot.imageUrl && (
                <div className="h-60 sm:h-72 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <span className="text-xs text-cyan-800 font-semibold">{selectedSpot.region}</span>
                <h2 className="text-xl font-bold text-slate-950 mt-1">{selectedSpot.name}</h2>
              </div>

              {selectedSpot.fishingType && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Recommended Fishing Method:</span>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {selectedSpot.fishingType}
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">About the Spot:</span>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedSpot.description}
                </p>
              </div>

              {selectedSpot.accessInstructions && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">How to Access:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedSpot.accessInstructions}
                  </p>
                </div>
              )}

              {selectedSpot.facilities && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Facilities & Amenities:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedSpot.facilities}
                  </p>
                </div>
              )}

              {selectedSpot.safetyGuidance && (
                <div>
                  <span className="text-xs font-semibold text-rose-700 block mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Safety & Regulations:</span>
                  </span>
                  <p className="text-xs text-rose-900 bg-rose-50 p-3 rounded-lg border border-rose-200/70 leading-relaxed">
                    {selectedSpot.safetyGuidance}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(`Hello Nelson, I would like advice on gear and recommended lures for fishing at ${selectedSpot.name} (${selectedSpot.region}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Ask Nelson for Gear Recommendations for this Spot</span>
                </a>
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { EventItem } from '../types/admin';
import {
  Calendar,
  MapPin,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

/**
 * Checks whether an event has expired based on status or date.
 * If expired, it should not appear in the top screen advert.
 */
function isEventExpired(event: EventItem, now: Date): boolean {
  // If explicitly unpublished or marked completed/cancelled, it is expired/inactive
  if (event.published === false) return true;
  if (event.status === 'completed' || event.status === 'cancelled') return true;

  // Use endDate if available, otherwise fallback to startDate
  const targetDateStr = event.endDate?.trim() || event.startDate?.trim();
  if (!targetDateStr) return false;

  const eventDate = new Date(targetDateStr);
  if (isNaN(eventDate.getTime())) return false;

  // If date string does not specify an explicit time (e.g. YYYY-MM-DD),
  // consider the event active until the end of that day (23:59:59.999).
  const hasSpecificTime = targetDateStr.includes(':') || targetDateStr.includes('T');
  if (!hasSpecificTime) {
    eventDate.setHours(23, 59, 59, 999);
  }

  return eventDate.getTime() < now.getTime();
}

export const TopEventsBanner: React.FC = () => {
  // Raw active events retrieved from Firestore
  const [rawEvents, setRawEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter raw Firestore events against current clock
  const filterActiveEvents = useCallback((items: EventItem[]): EventItem[] => {
    const now = new Date();
    const active = items.filter((event) => !isEventExpired(event, now));

    // Sort chronologically by start date
    active.sort((a, b) => {
      const timeA = new Date(a.startDate || '').getTime() || 0;
      const timeB = new Date(b.startDate || '').getTime() || 0;
      return timeA - timeB;
    });

    return active;
  }, []);

  // Real-time listener for Firestore events collection
  // When an event is deleted from Firestore, onSnapshot immediately fires and the advert disappears
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const list: EventItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as EventItem), id: d.id });
        });

        setRawEvents(list);
        setEvents(filterActiveEvents(list));
      },
      (err) => {
        console.warn('Could not load events for top banner:', err);
        setRawEvents([]);
        setEvents([]);
      }
    );

    return () => unsub();
  }, [filterActiveEvents]);

  // Periodic expiration checker: re-evaluates active events every 30 seconds
  // so expired events automatically disappear in real time without refreshing
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(filterActiveEvents(rawEvents));
    }, 30000);

    return () => clearInterval(interval);
  }, [rawEvents, filterActiveEvents]);

  // Ensure currentIndex stays within bounds when an event is deleted or expires
  useEffect(() => {
    if (currentIndex >= events.length && events.length > 0) {
      setCurrentIndex(0);
    }
  }, [events.length, currentIndex]);

  // Auto-rotate if multiple upcoming events
  useEffect(() => {
    if (events.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [events.length, isPaused]);

  // When no upcoming events exist (or when all have expired/deleted), the advert completely disappears
  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex] || events[0];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const formattedDate = formatDate(currentEvent.startDate);

  return (
    <aside
      aria-label="Upcoming Event Advert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-gradient-to-r from-amber-950 via-slate-950 to-emerald-950 text-white text-xs border-b border-amber-500/30 overflow-hidden shadow-sm"
    >
      {/* Background glow accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-2 relative flex items-center justify-between gap-3">
        {/* Left: Advert Badge & Event Details */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          {/* Pulsing Advert Badge */}
          <span className="hidden xs:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs shrink-0 animate-pulse">
            <Trophy className="w-3 h-3" />
            <span>Event Advert</span>
          </span>

          {/* Event Content & Location */}
          <div className="flex items-center gap-2 sm:gap-3 truncate text-xs">
            <span className="font-bold text-white tracking-tight truncate flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span className="truncate">{currentEvent.title}</span>
            </span>

            {formattedDate && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-amber-200/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{formattedDate}</span>
              </span>
            )}

            {currentEvent.location && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-300 truncate">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[200px]">{currentEvent.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions & Carousel Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Carousel Navigator if multiple events exist */}
          {events.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Previous event"
                aria-label="Previous event"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-amber-400 font-semibold">
                {currentIndex + 1}/{events.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Next event"
                aria-label="Next event"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct WhatsApp RSVP Button */}
          <a
            href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(
              `Hello Nelson, I saw the advert for "${currentEvent.title}" and would like to reserve a spot / register.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
            title="Register via WhatsApp"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Book on WhatsApp</span>
          </a>

          {/* Primary View Details Button */}
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all hover:scale-[1.02] shrink-0"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { EventItem } from '../types/admin';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Calendar, MapPin, Clock, MessageSquare, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

export const PublicEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        const list: EventItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as EventItem;
          if (data.published === true || (data.published as any) === 'true') {
            list.push({ ...data, id: d.id });
          }
        });
        setEvents(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error reading events:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Clearly distinguish upcoming events from past events
  const now = new Date();
  const upcomingEvents = events.filter((e) => {
    if (e.status === 'completed' || e.status === 'cancelled') return false;
    if (e.startDate) {
      const eventDate = new Date(e.startDate);
      if (!isNaN(eventDate.getTime()) && eventDate < now) {
        return false;
      }
    }
    return true;
  });

  const pastEvents = events.filter((e) => {
    if (e.status === 'completed') return true;
    if (e.startDate) {
      const eventDate = new Date(e.startDate);
      if (!isNaN(eventDate.getTime()) && eventDate < now && e.status !== 'cancelled') {
        return true;
      }
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Tournaments, Derbies & Community Meetups</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Angling Events & Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Fishing competitions, bass tournaments, casting days, and community angling gatherings organized or supported by FishWithNelson.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading events schedule...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No scheduled events right now</h3>
            <p className="text-xs text-slate-500">
              New tournaments and meetups will be posted here as dates are announced. Contact Nelson on WhatsApp for upcoming informal gatherings.
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming Events Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold text-slate-950 font-display">Upcoming Events</h2>
                <span className="text-xs text-slate-500">({upcomingEvents.length})</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No upcoming events currently scheduled. Check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {event.imageUrl && (
                          <div className="h-44 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 w-fit">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-950 font-display">
                            {event.title}
                          </h3>

                          {event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <div className="pt-3 border-t border-slate-100">
                          <a
                            href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(`Hello Nelson, I would like information or registration details for the event: "${event.title}".`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inquire / Register on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Events Section */}
            {pastEvents.length > 0 && (
              <section className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <h2 className="text-base font-bold text-slate-700 font-display">Past Tournaments & Events</h2>
                  <span className="text-xs text-slate-500">({pastEvents.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-85">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          Completed
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                      {event.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

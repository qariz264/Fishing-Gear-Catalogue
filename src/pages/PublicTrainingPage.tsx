import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TrainingItem } from '../types/admin';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GraduationCap, MapPin, Clock, CheckCircle2, MessageSquare, BookOpen } from 'lucide-react';
import { WHATSAPP_PHONE_INTERNATIONAL } from '../utils/whatsapp';

export const PublicTrainingPage: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'training'),
      (snapshot) => {
        const list: TrainingItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as TrainingItem;
          if (data.published === true || (data.published as any) === 'true') {
            list.push({ ...data, id: d.id });
          }
        });
        setTrainings(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error reading training sessions:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-500/20 selection:text-amber-900">
      <Header />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Angling Coaching & Practical Field Clinics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Fishing Classes & Skills Training
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Hands-on angling classes, casting technique correction, bait rigging workshops, and private lake sessions mentored by Nelson.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading available training classes...
          </div>
        ) : trainings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No scheduled sessions at this time</h3>
            <p className="text-xs text-slate-500">
              Classes and one-on-one coaching schedules will be posted here. Contact Nelson on WhatsApp directly if you would like a private session booked.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent('Hello Nelson, I would like to inquire about private fishing lessons and training.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inquire About Lessons on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {session.imageUrl && (
                    <div className="h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={session.imageUrl}
                        alt={session.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 w-fit">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      <span>{session.category}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-950 font-display">
                      {session.title}
                    </h2>

                    {session.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{session.venue}</span>
                      </div>
                    )}

                    {session.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Duration: {session.duration}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {session.description}
                    </p>

                    {session.learningObjectives && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                        <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider font-mono">
                          What You Will Learn:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{session.learningObjectives}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={`https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(`Hello Nelson, I would like to register or inquire about the training: "${session.title}".`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                      <span>Book / Inquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

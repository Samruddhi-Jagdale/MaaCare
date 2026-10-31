// src/components/PregnancyJourneyTracker.jsx
import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Baby,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PregnancyJourneyTracker({ woman, checkups = [], onScheduleClick }) {
  const { t, language } = useLanguage();

  if (!woman) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm text-center">
        <Info className="w-8 h-8 text-pink-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No pregnancy profile records found for this account.</p>
      </div>
    );
  }

  // Derive current pregnancy week and estimated progress
  let currentWeek = woman.pregnancyWeek ? Number(woman.pregnancyWeek) : null;
  let daysRemaining = null;

  if (woman.expectedDeliveryDate) {
    const today = new Date();
    const edd = new Date(woman.expectedDeliveryDate);
    const diffTime = edd.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (!currentWeek || isNaN(currentWeek)) {
      const weeksLeft = Math.round(daysRemaining / 7);
      currentWeek = Math.min(42, Math.max(1, 40 - weeksLeft));
    }
  } else if (woman.lastMenstrualPeriod) {
    const today = new Date();
    const lmp = new Date(woman.lastMenstrualPeriod);
    const diffDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    if (!currentWeek || isNaN(currentWeek)) {
      currentWeek = Math.min(42, Math.max(1, Math.floor(diffDays / 7)));
    }
  }

  const effectiveWeek = currentWeek || 20; // fallback midpoint if unspecified
  const progressPercent = Math.min(100, Math.max(5, Math.round((effectiveWeek / 40) * 100)));

  // Trimester definition
  let currentTrimester = 1;
  let trimesterLabel = t('trimester1');
  if (effectiveWeek > 12 && effectiveWeek <= 26) {
    currentTrimester = 2;
    trimesterLabel = t('trimester2');
  } else if (effectiveWeek > 26) {
    currentTrimester = 3;
    trimesterLabel = t('trimester3');
  }

  // Next upcoming checkup
  const upcomingList = checkups
    .filter((c) => c.status === 'Upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextAppointment = upcomingList.length > 0 ? upcomingList[0] : null;

  // Completed checkups
  const completedList = checkups
    .filter((c) => c.status === 'Completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Clinical Milestones Data
  const milestones = [
    {
      weekRange: '4-8',
      title: language === 'mr' ? 'पहिली तपासणी व नोंदणी' : '1st Antenatal Visit & Viability Scan',
      desc: language === 'mr' ? 'फॉलिक ॲसिड सुरू करणे आणि मूलभूत रक्त तपासण्या' : 'Early ultrasound, baseline blood panel, Folic Acid initiation',
      trimester: 1,
      minWeek: 4,
      maxWeek: 8,
    },
    {
      weekRange: '11-14',
      title: language === 'mr' ? 'एनटी स्कॅन व प्रथम तपासणी' : 'NT Scan & First Trimester Screening',
      desc: language === 'mr' ? 'गर्भाची सुरुवातीची वाढ आणि जनुकीय सुरक्षितता' : 'Nuchal Translucency ultrasound & dual marker test',
      trimester: 1,
      minWeek: 11,
      maxWeek: 14,
    },
    {
      weekRange: '18-20',
      title: language === 'mr' ? 'टिफा स्कॅन (TIFFA Anomaly Scan)' : 'TIFFA Scan & TT/Td Vaccination',
      desc: language === 'mr' ? 'बाळाच्या सर्व अवयवांची सविस्तर तपासणी' : 'Detailed fetal organ survey & maternal tetanus injection',
      trimester: 2,
      minWeek: 18,
      maxWeek: 20,
    },
    {
      weekRange: '24-28',
      title: language === 'mr' ? 'साखर तपासणी (OGTT) व लोह गोळ्या' : 'Gestational Diabetes Screen (OGTT)',
      desc: language === 'mr' ? 'गर्भावस्थेतील मधुमेहाची तपासणी व हिमोग्लोबिन तपासणी' : 'Glucose tolerance testing, Hb check & IFA supplement monitoring',
      trimester: 2,
      minWeek: 24,
      maxWeek: 28,
    },
    {
      weekRange: '32-34',
      title: language === 'mr' ? 'तिसरी सोनोग्राफी व रक्तदाब' : 'Fetal Growth & Doppler Scan',
      desc: language === 'mr' ? 'बाळाची वाढ, वजन आणि वारेचा रक्तपुरवठा' : 'Assessing fetal growth, amniotic fluid, and maternal blood pressure',
      trimester: 3,
      minWeek: 32,
      maxWeek: 34,
    },
    {
      weekRange: '36-37',
      title: language === 'mr' ? 'पूर्ण मुदत व प्रसूती नियोजन' : 'Full Term Assessment & Birth Plan',
      desc: language === 'mr' ? 'बाळाचे डोके खाली आले आहे का तपासणे आणि रुग्णालय निवड' : 'Cephalic position confirmation & emergency hospital readiness',
      trimester: 3,
      minWeek: 36,
      maxWeek: 37,
    },
    {
      weekRange: '40',
      title: language === 'mr' ? 'अपेक्षित प्रसूती तारीख (EDD)' : 'Expected Delivery Date',
      desc: language === 'mr' ? 'प्रसूतीची वेळ जवळ आली आहे. सतत लक्ष ठेवा' : 'Full term arrival of your healthy newborn baby',
      trimester: 3,
      minWeek: 39,
      maxWeek: 41,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Gestational Progress */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-teal-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{trimesterLabel}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                {t('week')} {effectiveWeek} <span className="text-lg font-medium opacity-90">/ 40 {t('weeks')}</span>
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                {woman.name} &bull; {woman.bloodGroup || 'Blood group not set'} &bull; {woman.age || 25} yrs
              </p>
            </div>

            {/* EDD Pill */}
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 text-right">
              <p className="text-[11px] text-white/80 uppercase font-semibold">{t('estimatedDueDate')}</p>
              <p className="text-lg font-extrabold mt-0.5">
                {woman.expectedDeliveryDate
                  ? new Date(woman.expectedDeliveryDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Date not confirmed'}
              </p>
              {daysRemaining !== null && (
                <p className="text-xs font-semibold text-teal-200 mt-0.5">
                  {daysRemaining} {t('daysRemaining')}
                </p>
              )}
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-white/90 mb-2">
              <span>{t('trimester1')}</span>
              <span>{t('trimester2')}</span>
              <span>{t('trimester3')}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-3.5 p-0.5 backdrop-blur-sm relative">
              <div
                className="bg-gradient-to-r from-amber-300 via-emerald-300 to-white h-2.5 rounded-full shadow-md transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Trimester marker dividers */}
              <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-white/40" title="Week 12" />
              <div className="absolute left-[65%] top-0 bottom-0 w-0.5 bg-white/40" title="Week 26" />
            </div>
            <div className="flex justify-between items-center text-[11px] text-white/75 mt-1 font-medium">
              <span>Week 1</span>
              <span className="font-bold text-white">{progressPercent}% Completed</span>
              <span>Week 40</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight */}
      {nextAppointment ? (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-200">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-200/60 text-teal-800">
                {t('upcomingAppointment')}
              </span>
              <h4 className="text-base font-bold text-gray-900 mt-1">{nextAppointment.type}</h4>
              <p className="text-xs text-gray-600 mt-0.5 flex items-center space-x-2">
                <span>
                  {new Date(nextAppointment.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>&bull;</span>
                <span className="font-semibold text-teal-800">{nextAppointment.time || '10:00 AM'}</span>
              </p>
            </div>
          </div>
          {nextAppointment.notes && (
            <p className="text-xs text-teal-900 bg-white/70 p-3 rounded-xl border border-teal-100 max-w-sm">
              <span className="font-semibold">Worker note:</span> {nextAppointment.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-xs font-semibold text-amber-900">{t('noUpcomingAppointment')}</p>
          </div>
          {onScheduleClick && (
            <button
              onClick={onScheduleClick}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              {t('scheduleNext')}
            </button>
          )}
        </div>
      )}

      {/* Stage Guidance & Milestones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological Timeline of Milestones & Visits */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-gray-800 text-base">{t('milestones')}</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {completedList.length} visits completed
            </span>
          </div>

          <div className="mt-6 relative pl-6 border-l-2 border-pink-100 space-y-6">
            {milestones.map((m, idx) => {
              const isPast = effectiveWeek > m.maxWeek;
              const isCurrent = effectiveWeek >= m.minWeek && effectiveWeek <= m.maxWeek;

              return (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition ${
                      isPast
                        ? 'bg-emerald-500 border-emerald-300'
                        : isCurrent
                        ? 'bg-pink-600 border-pink-300 ring-4 ring-pink-100 animate-pulse'
                        : 'bg-white border-gray-300'
                    }`}
                  />

                  <div
                    className={`p-4 rounded-2xl border transition ${
                      isCurrent
                        ? 'bg-pink-50/60 border-pink-200 shadow-sm'
                        : isPast
                        ? 'bg-emerald-50/30 border-emerald-100'
                        : 'bg-gray-50/50 border-gray-100 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-pink-600 text-white'
                              : isPast
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          Week {m.weekRange}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 animate-bounce">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-gray-400">
                        Trimester {m.trimester}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm mt-2">{m.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Educational Tips for Current Stage */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-50 to-pink-50 rounded-3xl p-6 border border-teal-100 shadow-sm">
            <div className="flex items-center space-x-2 text-teal-800 mb-3">
              <Baby className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-sm">
                {language === 'mr' ? 'सध्याच्या टप्प्यातील मार्गदर्शन' : 'Stage Care Guide'}
              </h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {currentTrimester === 1
                ? 'Your baby’s major organs are forming rapidly. Ensure daily Folic Acid intake, drink plenty of water, and avoid strenuous heavy lifting.'
                : currentTrimester === 2
                ? 'Baby begins kicking and hearing sounds! Ensure daily Iron and Calcium supplements (taken 2 hours apart) and schedule your detailed anomaly ultrasound.'
                : 'Rapid baby weight gain and lung development. Sleep on your left side to maximize placental blood flow, and count fetal kicks daily.'}
            </p>

            <div className="mt-4 pt-4 border-t border-teal-100 space-y-2">
              <div className="flex items-center text-xs font-semibold text-teal-900">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-600 shrink-0" />
                <span>Balanced Nutrition (Dal, Spinach, Milk)</span>
              </div>
              <div className="flex items-center text-xs font-semibold text-teal-900">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-600 shrink-0" />
                <span>Daily IFA & Calcium supplementation</span>
              </div>
              <div className="flex items-center text-xs font-semibold text-teal-900">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-600 shrink-0" />
                <span>Routine BP & Fetal movement check</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/80 rounded-2xl border border-teal-100 text-[11px] text-gray-500 leading-tight">
              <Info className="w-3.5 h-3.5 text-teal-600 inline mr-1" />
              Informational guidance only. Always follow the advice of your designated obstetrician or health worker.
            </div>
          </div>

          {/* Assigned Worker Quick Card */}
          {woman.assignedWorker && (
            <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
              <div className="flex items-center space-x-2 text-pink-700 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Assigned Health Worker</h4>
              </div>
              <p className="text-sm font-extrabold text-gray-800">{woman.assignedWorker.name}</p>
              {woman.assignedWorker.phone && (
                <a
                  href={`tel:${woman.assignedWorker.phone}`}
                  className="text-xs text-teal-600 hover:text-teal-800 font-semibold mt-1 inline-block"
                >
                  Call: {woman.assignedWorker.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

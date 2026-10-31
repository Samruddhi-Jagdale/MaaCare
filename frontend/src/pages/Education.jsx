// src/pages/Education.jsx
import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  Heart,
  Baby,
  Apple,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Education() {
  const { language, t } = useLanguage();
  const [activeTrimester, setActiveTrimester] = useState(1);
  const [eduData, setEduData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/education?lang=${language}`);
        setEduData(res.data);
      } catch (err) {
        console.error('Failed to load education resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEducation();
  }, [language]);

  const currentTrimesterData = eduData?.trimesterGuidance?.find(
    (t) => t.trimester === activeTrimester
  );

  return (
    <div className="min-h-screen bg-pink-50/40 text-gray-800 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4" />
            <span>MaaCare Clinical Knowledge Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {language === 'mr' ? 'मातृ आरोग्य व गर्भधारणा मार्गदर्शक' : 'Maternal Healthcare & Pregnancy Guide'}
          </h1>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {language === 'mr'
              ? 'राष्ट्रीय आरोग्य अभियानानुसार प्रमाणित वैद्यकीय मार्गदर्शक तत्त्वे — सुरक्षित मातृत्व आणि निरोगी बाळ'
              : 'Evidence-based clinical guidance aligned with WHO and National Health Mission protocols for safe motherhood.'}
          </p>
        </div>

        {/* Emergency Obstetric Warning Signs Banner */}
        <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-rose-400">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-200">
                  Critical Awareness &bull; त्वरित वैद्यकीय मदत
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                  {eduData?.emergencyCare?.headline || 'Emergency Obstetric Warning Signs'}
                </h2>
              </div>
            </div>

            {/* Helpline Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <a
                href="tel:108"
                className="flex items-center space-x-2 px-4 py-2.5 bg-white text-rose-700 rounded-2xl font-black text-xs shadow-md hover:bg-rose-50 transition"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>Call 108 (Ambulance)</span>
              </a>
              <a
                href="tel:102"
                className="flex items-center space-x-2 px-4 py-2.5 bg-rose-700/60 border border-white/30 text-white rounded-2xl font-bold text-xs hover:bg-rose-700 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 102 (Janani)</span>
              </a>
              <a
                href="tel:104"
                className="flex items-center space-x-2 px-4 py-2.5 bg-rose-700/60 border border-white/30 text-white rounded-2xl font-bold text-xs hover:bg-rose-700 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 104 (Health)</span>
              </a>
            </div>
          </div>

          {/* Danger Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {eduData?.emergencyCare?.dangerSigns.map((ds, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h4>{ds.sign}</h4>
                  </div>
                  <p className="text-xs text-white/90 mt-2 leading-relaxed">{ds.description}</p>
                </div>
                <p className="text-[11px] font-bold text-rose-200 mt-3 pt-2 border-t border-white/15">
                  Action: {ds.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trimester-wise Educational Guidance Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-black text-gray-900">
                {language === 'mr' ? 'तिमाहीनुसार काळजी व तपासण्या' : 'Trimester-Wise Maternal Care Roadmap'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Essential milestones, clinical checklists, and targeted maternal nutrition
              </p>
            </div>

            {/* Trimester Switch Buttons */}
            <div className="flex bg-pink-50 p-1.5 rounded-2xl border border-pink-100 self-start sm:self-auto">
              {[1, 2, 3].map((tri) => (
                <button
                  key={tri}
                  onClick={() => setActiveTrimester(tri)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTrimester === tri
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  {language === 'mr' ? `तिमाही ${tri}` : `Trimester ${tri}`}
                </button>
              ))}
            </div>
          </div>

          {currentTrimesterData && (
            <div className="space-y-6">
              {/* Stage Header */}
              <div className="bg-gradient-to-r from-teal-50 to-pink-50 p-5 rounded-2xl border border-teal-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-gray-800">{currentTrimesterData.title}</h4>
                  <span className="text-xs font-bold text-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200">
                    {currentTrimesterData.weeks}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                  <span className="font-bold text-gray-900">Baby Growth:</span>{' '}
                  {currentTrimesterData.fetalDevelopment}
                </p>
              </div>

              {/* 2-Col: Care Checklist & Nutrition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clinical Checklist */}
                <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                  <h5 className="font-bold text-sm text-teal-800 flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>
                      {language === 'mr' ? 'आरोग्य तपासणी व काळजी यादी' : 'Clinical Care & Test Checklist'}
                    </span>
                  </h5>
                  <ul className="space-y-2.5">
                    {currentTrimesterData.careChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 mr-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition */}
                <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                  <h5 className="font-bold text-sm text-pink-800 flex items-center space-x-2 mb-3">
                    <Apple className="w-4 h-4 text-pink-600" />
                    <span>
                      {language === 'mr' ? 'पौष्टिक आहार व सल्ले' : 'Nutrition & Healthy Eating Guide'}
                    </span>
                  </h5>
                  <ul className="space-y-2.5">
                    {currentTrimesterData.nutrition.map((item, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 mr-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <HelpCircle className="w-5 h-5 text-pink-600" />
            <h3 className="text-xl font-black text-gray-900">
              {language === 'mr' ? 'नेहमी विचारले जाणारे प्रश्न (FAQ)' : 'Frequently Asked Clinical Questions'}
            </h3>
          </div>

          <div className="space-y-3">
            {eduData?.faqs?.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-100 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between bg-gray-50/50 hover:bg-pink-50/40 transition"
                  >
                    <span className="font-bold text-xs sm:text-sm text-gray-800">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-pink-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 py-3.5 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

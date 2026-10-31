// src/components/DigitalHealthRecord.jsx
import React from 'react';
import {
  FileText,
  Activity,
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  User,
  Shield,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DigitalHealthRecord({ woman, checkups = [] }) {
  const { t, language } = useLanguage();

  if (!woman) return null;

  // Extract latest checkup with recorded vitals
  const checkupsWithVitals = checkups.filter(
    (c) => c.bloodPressure || c.weight || c.hemoglobin || c.bloodSugar || c.fetalHeartRate
  );
  const latestVitals = checkupsWithVitals.length > 0 ? checkupsWithVitals[0] : null;

  // Aggregate active supplements from latest checkups
  const allSupplements = [];
  const allPrescriptions = [];
  const reportedDangerSigns = [];

  checkups.forEach((c) => {
    if (Array.isArray(c.supplements)) {
      c.supplements.forEach((s) => {
        if (!allSupplements.some((item) => item.name === s.name)) {
          allSupplements.push({ ...s, visitDate: c.date });
        }
      });
    }
    if (Array.isArray(c.prescriptions)) {
      c.prescriptions.forEach((p) => {
        if (!allPrescriptions.some((item) => item.medicineName === p.medicineName)) {
          allPrescriptions.push({ ...p, visitDate: c.date });
        }
      });
    }
    if (Array.isArray(c.dangerSigns) && c.dangerSigns.length > 0) {
      c.dangerSigns.forEach((ds) => {
        reportedDangerSigns.push({ sign: ds, visitDate: c.date });
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-800 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>{t('healthRecordTitle')}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Maternal Health Passport &bull; Confidential Clinical Profile
          </p>
        </div>

        {/* Patient Key Identification Pill */}
        <div className="flex items-center space-x-2 bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-pink-700">
          <span>Blood Group: {woman.bloodGroup || 'Not Tested'}</span>
          <span>&bull;</span>
          <span>Age: {woman.age}</span>
        </div>
      </div>

      {/* Danger Signs Alert Banner (if any recorded in checkups) */}
      {reportedDangerSigns.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            <span>{t('dangerSignsAlert')}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {reportedDangerSigns.map((ds, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 shadow-xs"
              >
                {ds.sign} ({new Date(ds.visitDate).toLocaleDateString()})
              </span>
            ))}
          </div>
          <p className="text-xs text-rose-800 mt-2 font-medium">
            Urgent review recommended. Please follow up with your obstetrician or health center immediately.
          </p>
        </div>
      )}

      {/* Latest Vitals Summary Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>{t('vitalsSummary')}</span>
          {latestVitals && (
            <span className="text-[10px] text-gray-400 normal-case">
              (Recorded {new Date(latestVitals.date).toLocaleDateString()})
            </span>
          )}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* BP */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('bloodPressure')}</p>
            <p className="text-lg font-black text-gray-800 mt-1">
              {latestVitals?.bloodPressure || '—'}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">mmHg</span>
          </div>

          {/* Weight */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('weight')}</p>
            <p className="text-lg font-black text-gray-800 mt-1">
              {latestVitals?.weight ? `${latestVitals.weight}` : '—'}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">kg</span>
          </div>

          {/* Hemoglobin */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('hemoglobin')}</p>
            <p className="text-lg font-black text-gray-800 mt-1">
              {latestVitals?.hemoglobin ? `${latestVitals.hemoglobin}` : '—'}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">g/dL</span>
          </div>

          {/* Blood Sugar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('bloodSugar')}</p>
            <p className="text-sm font-bold text-gray-800 mt-1 truncate">
              {latestVitals?.bloodSugar || '—'}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">fasting/PP</span>
          </div>

          {/* Fetal Heart Rate */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('fetalHeartRate')}</p>
            <p className="text-lg font-black text-gray-800 mt-1">
              {latestVitals?.fetalHeartRate ? `${latestVitals.fetalHeartRate}` : '—'}
            </p>
            <span className="text-[10px] text-pink-600 font-medium">bpm (110-160)</span>
          </div>

          {/* Fundal Height */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-semibold text-gray-500">{t('fundalHeight')}</p>
            <p className="text-lg font-black text-gray-800 mt-1">
              {latestVitals?.fundalHeight ? `${latestVitals.fundalHeight}` : '—'}
            </p>
            <span className="text-[10px] text-teal-600 font-medium">cm</span>
          </div>
        </div>
      </div>

      {/* Supplements & Prescriptions 2-Col Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Supplements Schedule */}
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
          <div className="flex items-center space-x-2 text-pink-700 mb-3">
            <Pill className="w-5 h-5 text-pink-600" />
            <h4 className="font-bold text-sm">{t('activeSupplements')}</h4>
          </div>

          {allSupplements.length === 0 ? (
            <div className="p-4 bg-pink-50/50 rounded-2xl text-center text-xs text-gray-500">
              {t('noSupplements')}
            </div>
          ) : (
            <div className="space-y-3">
              {allSupplements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-gradient-to-r from-pink-50/40 to-teal-50/40 border border-pink-100 flex items-start justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-xs">{s.name}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {s.dosage} &bull; {s.frequency}
                    </p>
                    {s.instructions && (
                      <p className="text-[10px] text-teal-700 font-medium mt-1">
                        Instruction: {s.instructions}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions & Worker Advice */}
        <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-800 mb-3">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-sm">{t('prescriptions')}</h4>
          </div>

          {allPrescriptions.length === 0 ? (
            <div className="p-4 bg-teal-50/50 rounded-2xl text-center text-xs text-gray-500">
              {t('noPrescriptions')}
            </div>
          ) : (
            <div className="space-y-3">
              {allPrescriptions.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-teal-50/30 border border-teal-100 flex items-start justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-xs">{p.medicineName}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{p.dosage}</p>
                    {p.instructions && (
                      <p className="text-[10px] text-teal-800 font-medium mt-1">
                        {p.instructions}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(p.visitDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

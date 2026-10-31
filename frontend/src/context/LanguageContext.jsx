// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: 'MaaCare',
    tagline: 'AI-Enhanced Maternal Healthcare Platform',
    navHome: 'Home',
    navDashboard: 'Dashboard',
    navEducation: 'Maternal Guide',
    navLogout: 'Sign Out',
    langToggle: 'मराठी',
    welcomeBack: 'Welcome back',
    roleAdmin: 'System Administrator',
    roleWorker: 'Health Worker',
    roleWoman: 'Expectant Mother',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications at this time',
    markAllRead: 'Mark all as read',
    viewAll: 'View all notifications',
    
    // Pregnancy Journey Tracker
    journeyTrackerTitle: 'Pregnancy Journey Tracker',
    currentWeek: 'Current Gestation',
    week: 'Week',
    weeks: 'weeks',
    trimester1: '1st Trimester (Weeks 1-12)',
    trimester2: '2nd Trimester (Weeks 13-26)',
    trimester3: '3rd Trimester (Weeks 27-40+)',
    estimatedDueDate: 'Estimated Due Date (EDD)',
    daysRemaining: 'days remaining',
    milestones: 'Clinical Milestones',
    upcomingAppointment: 'Upcoming Appointment',
    noUpcomingAppointment: 'No upcoming appointments scheduled',
    scheduleNext: 'Schedule Checkup',
    
    // Digital Health Record
    healthRecordTitle: 'Digital Maternal Health Record',
    vitalsSummary: 'Vitals & Measurements',
    bloodPressure: 'Blood Pressure',
    weight: 'Weight',
    hemoglobin: 'Hemoglobin (Hb)',
    bloodSugar: 'Blood Sugar',
    fetalHeartRate: 'Fetal Heart Rate',
    fundalHeight: 'Fundal Height',
    activeSupplements: 'Active Supplements Schedule',
    prescriptions: 'Medical Prescriptions',
    noSupplements: 'No active supplements recorded yet',
    noPrescriptions: 'No prescriptions recorded',
    dangerSignsAlert: 'Reported Red Flags / Danger Signs',
    noDangerSigns: 'No danger signs recorded — vitals normal',
    
    // Common actions & statuses
    statusUpcoming: 'Upcoming',
    statusCompleted: 'Completed',
    statusOverdue: 'Overdue',
    statusMissed: 'Missed',
    statusCancelled: 'Cancelled',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading clinical records...',
    searchPlaceholder: 'Search by mother name or phone...',
    exportCSV: 'Export CSV Report',
    emergencyHelpline: 'Emergency Ambulance 108 | Janani Helpline 102 | Health 104',
  },
  mr: {
    appName: 'माकेअर (MaaCare)',
    tagline: 'मातृ आरोग्य संनियंत्रण प्रणाली',
    navHome: 'मुख्यपृष्ठ',
    navDashboard: 'डॅशबोर्ड',
    navEducation: 'मातृ आरोग्य मार्गदर्शक',
    navLogout: 'बाहेर पडा',
    langToggle: 'English',
    welcomeBack: 'स्वागत आहे',
    roleAdmin: 'प्रणाली प्रशासक',
    roleWorker: 'आरोग्य सेविका (आशा)',
    roleWoman: 'गर्भवती माता',
    
    // Notifications
    notifications: 'सूचना',
    noNotifications: 'सध्या कोणत्याही नवीन सूचना नाहीत',
    markAllRead: 'सर्व वाचल्याचे चिन्हांकित करा',
    viewAll: 'सर्व सूचना पहा',
    
    // Pregnancy Journey Tracker
    journeyTrackerTitle: 'मातृत्वाचा प्रवास ट्रॅकर (Pregnancy Tracker)',
    currentWeek: 'सध्याचा गर्भधारणेचा आठवडा',
    week: 'आठवडा',
    weeks: 'आठवडे',
    trimester1: 'पहिली तिमाही (आठवडे १ ते १२)',
    trimester2: 'दुसरी तिमाही (आठवडे १३ ते २६)',
    trimester3: 'तिसरी तिमाही (आठवडे २७ ते ४०+)',
    estimatedDueDate: 'अपेक्षित प्रसूती तारीख (EDD)',
    daysRemaining: 'दिवस शिल्लक',
    milestones: 'महत्त्वाचे टप्पे व तपासण्या',
    upcomingAppointment: 'पुढील नियोजित तपासणी',
    noUpcomingAppointment: 'सध्या कोणतीही पुढील भेट नियोजित नाही',
    scheduleNext: 'तपासणीची नोंद करा',
    
    // Digital Health Record
    healthRecordTitle: 'डिजिटल मातृ आरोग्य पत्रिका (Health Record)',
    vitalsSummary: 'शारीरिक तपासणी व नोंदी',
    bloodPressure: 'रक्तदाब (BP)',
    weight: 'वजन (Weight)',
    hemoglobin: 'हिमोग्लोबिन (Hb)',
    bloodSugar: 'रक्तातील साखर (Sugar)',
    fetalHeartRate: 'बाळाचे हृदयाचे ठोके',
    fundalHeight: 'गर्भाशयाची उंची',
    activeSupplements: 'सुरू असलेली पूरक औषधे (IFA/कॅल्शियम)',
    prescriptions: 'वैद्यकीय औषधोपचार',
    noSupplements: 'सध्या कोणतीही पूरक औषधे नोंदवलेली नाहीत',
    noPrescriptions: 'कोणतीही विशेष औषधे नोंदवलेली नाहीत',
    dangerSignsAlert: 'धोक्याची लक्षणे (Red Flags)',
    noDangerSigns: 'कोणतीही धोक्याची लक्षणे नाहीत — स्थिती सामान्य',
    
    // Common actions & statuses
    statusUpcoming: 'नियोजित (Upcoming)',
    statusCompleted: 'पूर्ण (Completed)',
    statusOverdue: 'थकबाकी (Overdue)',
    statusMissed: 'चुकलेली (Missed)',
    statusCancelled: 'रद्द (Cancelled)',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    loading: 'माहिती लोड होत आहे...',
    searchPlaceholder: 'मातेचे नाव किंवा फोन नंबर शोधा...',
    exportCSV: 'अहवाल डाउनलोड करा (CSV)',
    emergencyHelpline: 'आपत्कालीन रुग्णवाहिका १०८ | जननी सुरक्षा १०२ | आरोग्य हेल्पलाइन १०४',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('maacare_lang') || 'en';
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'mr' : 'en';
      localStorage.setItem('maacare_lang', next);
      return next;
    });
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

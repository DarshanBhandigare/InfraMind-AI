import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'hi', name: 'हिन्दी', flag: 'HI' },
    { code: 'mr', name: 'मराठी', flag: 'MR' }
  ];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher-wrap" style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '0',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '150px'
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: i18n.language === lang.code ? 'var(--primary)' : 'transparent',
                  color: i18n.language === lang.code ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{ 
                  fontSize: '10px', 
                  background: i18n.language === lang.code ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {lang.flag}
                </span>
                {lang.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
          position: 'relative'
        }}
      >
        <Languages size={24} />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: 'var(--primary)'
          }}
        >
          <ChevronUp size={12} strokeWidth={3} />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default LanguageSwitcher;

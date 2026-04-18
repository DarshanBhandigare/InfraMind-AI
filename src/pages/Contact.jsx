import React, { useMemo, useState } from 'react';
import { Mail, MapPin, Phone, Clock, ChevronDown, ChevronUp, Send, Zap, Headphones, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = useMemo(
    () => [
      { question: t('contact.faq.q1'), answer: t('contact.faq.a1') },
      { question: t('contact.faq.q2'), answer: t('contact.faq.a2') },
      { question: t('contact.faq.q3'), answer: t('contact.faq.a3') },
      { question: t('contact.faq.q4'), answer: t('contact.faq.a4') }
    ],
    [t]
  );

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'unread'
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', department: '', message: '' });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert(t('contact.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px' }}>
      <section className="container" style={{ padding: '80px 0 40px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '16px' }}>
          {t('contact.title')}
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
          {t('contact.lead')}
        </p>
      </section>

      <section className="container" style={{ paddingBottom: '80px' }}>
        <div className="contact-grid">

          <div className="card" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
            {submitted ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle2 size={40} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>{t('contact.successTitle')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '32px' }}>
                  {t('contact.successBody')}
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn-primary" 
                  style={{ width: 'fit-content', padding: '12px 32px' }}
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '32px' }}>{t('contact.portalTitle')}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                  <div className="contact-form-row">
                    <div>
                      <label style={labelStyle}>{t('contact.labels.name')}</label>
                      <input 
                        type="text" 
                        required
                        className="input-field" 
                        placeholder={t('contact.placeholders.name')}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('contact.labels.email')}</label>
                      <input 
                        type="email" 
                        required
                        className="input-field" 
                        placeholder={t('contact.placeholders.email')}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.labels.department')}</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={t('contact.placeholders.department')}
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.labels.message')}</label>
                    <textarea 
                      className="input-field" 
                      rows="5" 
                      required
                      placeholder={t('contact.placeholders.message')} 
                      style={{ resize: 'none' }}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="btn-primary" 
                    style={{ width: 'fit-content', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? t('contact.sending') : <>{t('contact.submit')} <Send size={18} /></>}
                  </button>
                </form>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={iconBoxStyle}><MapPin size={24} color="var(--primary)" /></div>
              <div>
                <h3 style={cardTitleStyle}>{t('contact.cards.adminTitle')}</h3>
                <p style={cardTextStyle}>
                  {t('contact.cards.adminLine1')}<br />{t('contact.cards.adminLine2')}<br />{t('contact.cards.adminLine3')}
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={{ ...iconBoxStyle, background: '#e3fcef' }}><Zap size={24} color="#36B37E" /></div>
              <div>
                <h3 style={cardTitleStyle}>{t('contact.cards.channelsTitle')}</h3>
                <p style={cardTextStyle}>
                  <Phone size={14} style={{ marginRight: '8px' }} /> (555) 012-3456<br />
                  <Mail size={14} style={{ marginRight: '8px' }} /> support@inframind.gov
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={{ ...iconBoxStyle, background: '#fff0b3' }}><Clock size={24} color="#FFAB00" /></div>
              <div>
                <h3 style={cardTitleStyle}>{t('contact.cards.supportTitle')}</h3>
                <p style={cardTextStyle}>
                  {t('contact.cards.supportWeekdays')}<br /><strong>{t('contact.cards.supportHoursBold')}</strong>
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                  {t('contact.cards.supportNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '48px' }}>{t('contact.faqTitle')}</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>{faq.question}</span>
                  {activeFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {activeFaq === index && (
                  <div style={{ paddingBottom: '24px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="container contact-footer">
        <div>
          <h4 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>{t('contact.footerBrand')}</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('contact.footerCopy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span>{t('contact.footerLinks.privacy')}</span>
          <span>{t('contact.footerLinks.terms')}</span>
          <span>{t('contact.footerLinks.accessibility')}</span>
          <span>{t('contact.footerLinks.status')}</span>
        </div>
      </footer>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '8px',
  letterSpacing: '0.5px'
};

const iconBoxStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  background: 'var(--primary-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  marginBottom: '12px'
};

const cardTextStyle = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: 'var(--text-muted)'
};

export default Contact;

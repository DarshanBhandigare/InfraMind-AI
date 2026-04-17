import React, { useState } from 'react';
import { Mail, MapPin, Phone, Clock, ChevronDown, ChevronUp, Send, Building2, Zap, Headphones, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "How quickly are reported issues reviewed?",
      answer: "Issues are triaged by our AI system instantly. Critical hazards are usually reviewed by a human operator within 15-30 minutes."
    },
    {
      question: "Can I track the status of my report?",
      answer: "Yes, you can track your reports in the Citizen Dashboard. You will also receive email notifications at each stage of the process."
    },
    {
      question: "Who should I contact for commercial development inquiries?",
      answer: "Please contact the City Administration department using the form or the direct channel listed below for all commercial inquiries."
    },
    {
      question: "What data does InfraMind AI collect from reports?",
      answer: "We collect geolocation, issue type, images, and descriptions. Personal data is encrypted and used only for essential communication."
    }
  ];

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
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero Section */}
      <section className="container" style={{ padding: '80px 0 40px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '16px' }}>
          Contact
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
          Connect with our team. Whether you're reporting an urgent maintenance need or inquiring about municipal data, we're here to bridge the gap between intelligence and action.
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>

          {/* Inquiry Portal Form */}
          <div className="card" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
            {submitted ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle2 size={40} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Inquiry Received</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '32px' }}>
                  Your message has been logged in our administrative command center. 
                  A department representative will respond shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn-primary" 
                  style={{ width: 'fit-content', padding: '12px 32px' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '32px' }}>Inquiry Portal</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Name</label>
                      <input 
                        type="text" 
                        required
                        className="input-field" 
                        placeholder="Jane Cooper"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input 
                        type="email" 
                        required
                        className="input-field" 
                        placeholder="jane@citygov.org"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Department/Organization</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Public Works / Planning Dept"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Message</label>
                    <textarea 
                      className="input-field" 
                      rows="5" 
                      required
                      placeholder="Detail your inquiry or infrastructure concern..." 
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
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'} <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info Cards Side */}
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Card 1: Admin */}
            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={iconBoxStyle}><MapPin size={24} color="var(--primary)" /></div>
              <div>
                <h3 style={cardTitleStyle}>City Administration</h3>
                <p style={cardTextStyle}>Metropolis Civic Center<br />777 Innovation Way, Suite 400<br />Metropolis, MC 80210</p>
              </div>
            </div>

            {/* Card 2: Channels */}
            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={{ ...iconBoxStyle, background: '#e3fcef' }}><Zap size={24} color="#36B37E" /></div>
              <div>
                <h3 style={cardTitleStyle}>Direct Channels</h3>
                <p style={cardTextStyle}>
                  <Phone size={14} style={{ marginRight: '8px' }} /> (555) 012-3456<br />
                  <Mail size={14} style={{ marginRight: '8px' }} /> support@inframind.gov
                </p>
              </div>
            </div>

            {/* Card 3: Support */}
            <div className="card" style={{ padding: '32px', display: 'flex', gap: '20px' }}>
              <div style={{ ...iconBoxStyle, background: '#fff0b3' }}><Clock size={24} color="#FFAB00" /></div>
              <div>
                <h3 style={cardTitleStyle}>Citizen Support</h3>
                <p style={cardTextStyle}>Monday – Friday<br /><strong>08:00 AM – 06:00 PM EST</strong></p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                  Automated reporting portal is available 24/7 for emergency alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '48px' }}>Infrastructure Reporting FAQ</h2>
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

      {/* Simple Footer */}
      <footer className="container" style={{ padding: '60px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', marginTop: '80px' }}>
        <div>
          <h4 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '4px' }}>InfraMind AI</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2024 InfraMind AI. Civic Infrastructure Excellence.</p>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Accessibility</span>
          <span>Status</span>
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

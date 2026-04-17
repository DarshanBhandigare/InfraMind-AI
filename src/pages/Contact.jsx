import React, { useState } from 'react';
import { Mail, MapPin, Phone, Clock, ChevronDown, ChevronUp, Send, Building2, Zap, Headphones } from 'lucide-react';
import commandCenter from '../assets/command-center.png';

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);

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

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
      {/* Hero Section */}
      <section className="container" style={{ padding: '80px 0 40px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '16px' }}>
          Contact the Digital Architect.
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
          Connect with our civic infrastructure team. Whether you're reporting an urgent maintenance need or inquiring about municipal data, we're here to bridge the gap between intelligence and action.
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          
          {/* Inquiry Portal Form */}
          <div className="card" style={{ padding: '48px' }}>
            <h2 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '32px' }}>Inquiry Portal</h2>
            <form style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input type="text" className="input-field" placeholder="Jane Cooper" />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" className="input-field" placeholder="jane@citygov.org" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Department/Organization</label>
                <input type="text" className="input-field" placeholder="Public Works / Planning Dept" />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea className="input-field" rows="5" placeholder="Detail your inquiry or infrastructure concern..." style={{ resize: 'none' }}></textarea>
              </div>
              <button className="btn-primary" style={{ width: 'fit-content', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Submit Inquiry <Send size={18} />
              </button>
            </form>
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

      {/* Image Banner */}
      <section style={{ marginTop: '80px' }}>
        <div className="container">
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '400px', position: 'relative' }}>
            <img src={commandCenter} alt="Metropolis Command Center" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="glass-effect" style={{ position: 'absolute', bottom: '24px', left: '24px', padding: '16px 24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: 0 }}>Metropolis Command Center</h3>
              <p style={{ fontSize: '13px', margin: '4px 0 0', color: 'var(--text-muted)' }}>Live infrastructure monitoring active across all 12 municipal sectors.</p>
            </div>
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

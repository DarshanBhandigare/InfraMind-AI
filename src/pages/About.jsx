import React from 'react';
import { AlertTriangle, Brain, Download, ExternalLink, FileText, HelpCircle, Phone, Shield, Siren } from 'lucide-react';

const resourceGroups = [
  {
    title: 'Emergency Contacts',
    icon: <Phone size={26} />,
    accent: 'linear-gradient(135deg, #ff6b6b, #ef4444)',
    items: [
      {
        label: 'BMC Helpline - 1916',
        href: 'tel:1916',
        meta: '24x7 municipal help line'
      },
      {
        label: 'Police Control Room - 100',
        href: 'tel:100',
        meta: 'Mumbai Police emergency line'
      },
      {
        label: 'Ambulance - 108',
        href: 'tel:108',
        meta: 'NHM Maharashtra MEMS'
      },
      {
        label: 'Fire Brigade - 101',
        href: 'tel:101',
        meta: 'Mumbai fire emergency'
      }
    ]
  },
  {
    title: 'Govt. & Civic Links',
    icon: <Shield size={26} />,
    accent: 'linear-gradient(135deg, #4b7bec, #2563eb)',
    items: [
      {
        label: 'Official BMC Website',
        href: 'https://www.mcgm.gov.in/',
        meta: 'Brihanmumbai Municipal Corporation'
      },
      {
        label: 'Register BMC Complaint',
        href: 'https://www.mcgm.gov.in/irj/portal/anonymous/qlCLCComp',
        meta: 'Civic complaint and grievance portal'
      },
      {
        label: 'Aaple Sarkar',
        href: 'https://aaplesarkar.mahaonline.gov.in/en',
        meta: 'Maharashtra government citizen services'
      },
      {
        label: 'Mumbai Police Online Complaint',
        href: 'https://mumbaipolice.gov.in/OnlineComplaints?ps_id=0',
        meta: 'Official minor complaint portal'
      }
    ]
  },
  {
    title: 'Safety Awareness',
    icon: <AlertTriangle size={26} />,
    accent: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    items: [
      {
        label: 'Identify risk early',
        href: 'https://www.mumbaipolice.gov.in/impcontacts',
        meta: 'Keep emergency contacts available'
      },
      {
        label: 'Report before escalation',
        href: 'https://www.mcgm.gov.in/',
        meta: 'Use BMC complaint channels quickly'
      },
      {
        label: 'Document location clearly',
        href: 'https://aaplesarkar.mahaonline.gov.in/en',
        meta: 'Useful when filing civic reports'
      }
    ]
  },
  {
    title: 'AI Risk Insights',
    icon: <Brain size={26} />,
    accent: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    items: [
      {
        label: 'Top risk factors',
        href: 'https://www.mcgm.gov.in/',
        meta: 'Roads, drainage, lighting, and civic assets'
      },
      {
        label: 'High-risk areas',
        href: 'https://www.mcgm.gov.in/irj/portal/anonymous/qlCLCComp',
        meta: 'Can later be replaced by Firebase analytics'
      },
      {
        label: 'Priority escalation signals',
        href: 'https://www.mumbaipolice.gov.in/impcontacts',
        meta: 'Emergency response channels'
      }
    ]
  }
];

const secondaryResources = [
  {
    title: 'User Guide',
    icon: <FileText size={28} />,
    actions: [
      { label: 'How to Report', href: 'https://www.mcgm.gov.in/irj/portal/anonymous/qlCLCComp' },
      { label: 'Track Your Complaint', href: 'https://www.mcgm.gov.in/irj/portal/anonymous/qlCLCComp' }
    ]
  },
  {
    title: 'FAQs',
    icon: <HelpCircle size={28} />,
    actions: [
      { label: 'Emergency Contacts', href: 'https://www.mumbaipolice.gov.in/impcontacts' },
      { label: 'Risk Score Info', href: 'https://www.mcgm.gov.in/' }
    ]
  },
  {
    title: 'Downloads & Docs',
    icon: <Download size={28} />,
    actions: [
      { label: 'BMC Portal', href: 'https://www.mcgm.gov.in/' },
      { label: 'Govt. Services', href: 'https://aaplesarkar.mahaonline.gov.in/en' }
    ]
  }
];

const About = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', background: 'linear-gradient(180deg, #cfe5ff 0%, #eef5ff 28%, #f8fbff 100%)' }}>
      <section style={{ maxWidth: '1220px', margin: '0 auto', padding: '56px 40px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
          <h1 style={{ fontSize: '64px', marginBottom: '10px', color: '#ffffff', textShadow: '0 10px 30px rgba(37, 99, 235, 0.25)' }}>
            Resources
          </h1>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', textShadow: '0 8px 20px rgba(37, 99, 235, 0.22)' }}>
            Stay Informed & Prepared
          </p>
          <p style={{ maxWidth: '860px', margin: '16px auto 0', color: '#36506f', fontSize: '16px', lineHeight: 1.7 }}>
            These contact numbers and links are set up so demo entries can later be replaced by Firebase-managed records. For now, this page uses official government and civic service endpoints for Mumbai and Maharashtra.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '18px', marginBottom: '22px' }}>
          {resourceGroups.map((group) => (
            <article key={group.title} style={resourceCardStyle}>
              <div style={{ ...resourceHeaderStyle, background: group.accent }}>
                <div style={resourceIconWrapStyle}>{group.icon}</div>
                <h3 style={{ color: 'white', fontSize: '28px', lineHeight: 1.1 }}>{group.title}</h3>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      style={resourceLinkButtonStyle}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <ExternalLink size={15} />
                        <span>{item.label}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.88 }}>{item.meta}</div>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px', marginBottom: '26px' }}>
          {secondaryResources.map((resource) => (
            <article key={resource.title} style={{ ...resourceCardStyle, display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', minHeight: '188px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--primary)' }}>
                {resource.icon}
              </div>
              <div style={{ padding: '22px 22px 22px 0' }}>
                <h3 style={{ fontSize: '30px', marginBottom: '18px' }}>{resource.title}</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {resource.actions.map((action, index) => (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        ...flatActionLinkStyle,
                        background: index === 0 ? 'linear-gradient(135deg, #ff7b72, #ef4444)' : 'linear-gradient(135deg, #4ade80, #16a34a)'
                      }}
                    >
                      <ExternalLink size={15} />
                      <span>{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 24px 40px rgba(70, 113, 167, 0.12)', borderRadius: '26px', padding: '18px', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '18px', background: 'white', borderRadius: '22px', padding: '14px 18px', border: '1px solid #e5edf8' }}>
            <div style={{ width: '92px', height: '92px', borderRadius: '22px', background: 'linear-gradient(135deg, #e0ecff, #f8fbff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Siren size={42} />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', padding: '10px 20px', borderRadius: '14px', fontSize: '22px', fontWeight: 800, marginBottom: '14px' }}>
                <AlertTriangle size={22} /> AI Safety Tip
              </div>
              <p style={{ fontSize: '22px', color: '#36506f', lineHeight: 1.5 }}>
                Save `1916`, `100`, `101`, and `108` before monsoon season. Later, this panel can be fed by Firebase for live ward alerts, safety notices, and emergency advisories.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const resourceCardStyle = {
  background: 'rgba(255,255,255,0.82)',
  borderRadius: '22px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 20px 34px rgba(88, 118, 164, 0.12)',
  backdropFilter: 'blur(18px)'
};

const resourceHeaderStyle = {
  padding: '18px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const resourceIconWrapStyle = {
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  flexShrink: 0
};

const resourceLinkButtonStyle = {
  width: '100%',
  display: 'grid',
  gap: '4px',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #34d399, #16a34a)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '15px',
  fontWeight: 700,
  boxShadow: '0 10px 20px rgba(22, 163, 74, 0.16)',
  textDecoration: 'none',
  textAlign: 'center'
};

const flatActionLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'center',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '15px',
  fontWeight: 700,
  boxShadow: '0 10px 20px rgba(22, 163, 74, 0.16)',
  textDecoration: 'none'
};

export default About;

import React from 'react';
import { AlertTriangle, ExternalLink, Phone, Shield } from 'lucide-react';

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
        label: 'Flood Safety Guide',
        href: 'https://dm.mcgm.gov.in/flood-preparedness-guidelines',
        meta: 'What to do during floods?'
      },
      {
        label: 'Emergency Protocol',
        href: 'https://ndma.gov.in/',
        meta: 'Safety steps for disasters'
      },
      {
        label: 'Civic Awareness',
        href: 'https://www.mcgm.gov.in/',
        meta: 'Stay updated with BMC alerts'
      }
    ]
  }
];


const About = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', background: 'linear-gradient(180deg, #cfe5ff 0%, #eef5ff 28%, #f8fbff 100%)' }}>
      <section style={{ maxWidth: '1220px', margin: '0 auto', padding: '56px 40px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
          <h1 style={{ fontSize: '52px', marginBottom: '10px', textShadow: '0 10px 30px rgba(37, 99, 235, 0.25)' }}>
            Resources
          </h1>
          <p style={{ fontSize: '22px', fontWeight: 700, textShadow: '0 8px 20px rgba(37, 99, 235, 0.22)' }}>
            Stay Informed & Prepared
          </p>
          <p style={{ maxWidth: '860px', margin: '16px auto 0', color: '#36506f', fontSize: '16px', lineHeight: 1.7 }}>
            These contact numbers and links are set up so demo entries can later be replaced by Firebase-managed records. For now, this page uses official government and civic service endpoints for Mumbai and Maharashtra.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px', marginBottom: '22px' }}>
          {resourceGroups.map((group) => (
            <article key={group.title} style={resourceCardStyle}>
              <div style={resourceHeaderStyle}>
                <div style={{ ...resourceIconWrapStyle, color: group.accent.split(',')[1].trim().replace(')', '') }}>{group.icon}</div>
                <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: 800, lineHeight: 1.1 }}>{group.title}</h3>
              </div>
              <div style={{ padding: '0 18px 24px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      style={{
                        ...resourceLinkButtonStyle,
                        borderColor: group.accent.split(',')[1].trim().replace(')', '') + '33', // 20% opacity border
                        color: group.accent.split(',')[1].trim().replace(')', '')
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <ExternalLink size={14} />
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>{item.meta}</div>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

      </section>
    </div>
  );
};

const resourceCardStyle = {
  background: '#ffffff',
  borderRadius: '24px',
  overflow: 'hidden',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s ease'
};

const resourceHeaderStyle = {
  padding: '24px 18px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px'
};

const resourceIconWrapStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
  flexShrink: 0
};

const resourceLinkButtonStyle = {
  width: '100%',
  display: 'grid',
  gap: '2px',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#ffffff',
  borderRadius: '16px',
  padding: '14px',
  border: '1px solid',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'all 0.2s ease'
};

const flatActionLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'center',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  fontWeight: 700,
  boxShadow: '0 10px 20px rgba(22, 163, 74, 0.16)',
  textDecoration: 'none'
};

export default About;

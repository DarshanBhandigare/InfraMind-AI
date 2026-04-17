import React from 'react';
import { AlertTriangle, ExternalLink, Phone, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const resourceGroups = [
  {
    title: 'Emergency Contacts',
    icon: <Phone size={24} />,
    color: '#ef4444', // Red
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
    icon: <Shield size={24} />,
    color: '#3b82f6', // Blue
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
    icon: <AlertTriangle size={24} />,
    color: '#f59e0b', // Yellow
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
    <div style={pageContainerStyle}>
      <section style={contentSectionStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            Resources
          </h1>
          <p style={subtitleStyle}>
            Stay Informed & Prepared
          </p>
          <p style={descriptionStyle}>
            These contact numbers and links are set up so demo entries can later be replaced by Firebase-managed records. For now, this page uses official government and civic service endpoints for Mumbai and Maharashtra.
          </p>
        </div>

        <div style={gridStyle}>
          {resourceGroups.map((group) => (
            <article key={group.title} style={glassCardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ ...iconContainerStyle, color: group.color, background: `${group.color}15`, boxShadow: `0 0 15px ${group.color}20` }}>
                  {group.icon}
                </div>
                <h3 style={cardTitleStyle}>{group.title}</h3>
              </div>
              
              <div style={listContainerStyle}>
                {group.items.map((item) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    style={listItemStyle}
                    whileHover={{ 
                      scale: 1.02, 
                      backgroundColor: 'white', 
                      boxShadow: `0 8px 20px ${group.color}25`,
                      borderColor: `${group.color}30`
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={listLeftContentStyle}>
                      <div style={{ color: group.color, display: 'flex', alignItems: 'center' }}>
                        <ExternalLink size={18} />
                      </div>
                      <div>
                        <div style={itemLabelStyle}>{item.label}</div>
                        <div style={itemMetaStyle}>{item.meta}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#475569" style={{ flexShrink: 0 }} />
                  </motion.a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

// Styles
const pageContainerStyle = {
  minHeight: '100vh',
  paddingTop: '120px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  color: '#0f172a',
  fontFamily: '"Inter", sans-serif'
};

const contentSectionStyle = {
  maxWidth: '1220px',
  margin: '0 auto',
  padding: '40px 40px 80px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '60px'
};

const titleStyle = {
  fontSize: '56px',
  marginBottom: '16px',
  fontWeight: 900,
  letterSpacing: '-1.5px',
  color: '#0f172a'
};

const subtitleStyle = {
  fontSize: '22px',
  fontWeight: 600,
  color: '#475569'
};

const descriptionStyle = {
  maxWidth: '800px',
  margin: '24px auto 0',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: 1.6
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '30px'
};

const glassCardStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '32px'
};

const iconContainerStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const cardTitleStyle = {
  fontSize: '22px',
  fontWeight: 800,
  margin: 0,
  color: '#0f172a'
};

const listContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flex: 1
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: '16px',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const listLeftContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1
};

const itemLabelStyle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: '4px'
};

const itemMetaStyle = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: 1.4
};

export default About;

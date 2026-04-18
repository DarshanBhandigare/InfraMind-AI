import React, { useMemo } from 'react';
import { AlertTriangle, ExternalLink, Phone, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const resourceGroups = useMemo(
    () => [
      {
        title: t('about.emergency.title'),
        icon: <Phone size={26} />,
        accent: 'linear-gradient(135deg, #ff6b6b, #ef4444)',
        items: [
          { label: t('about.emergency.bmc1916.label'), href: 'tel:1916', meta: t('about.emergency.bmc1916.meta') },
          { label: t('about.emergency.police100.label'), href: 'tel:100', meta: t('about.emergency.police100.meta') },
          { label: t('about.emergency.ambulance108.label'), href: 'tel:108', meta: t('about.emergency.ambulance108.meta') },
          { label: t('about.emergency.fire101.label'), href: 'tel:101', meta: t('about.emergency.fire101.meta') }
        ]
      },
      {
        title: t('about.gov.title'),
        icon: <Shield size={26} />,
        accent: 'linear-gradient(135deg, #4b7bec, #2563eb)',
        items: [
          { label: t('about.gov.bmcSite.label'), href: 'https://www.mcgm.gov.in/', meta: t('about.gov.bmcSite.meta') },
          { label: t('about.gov.bmcComplaint.label'), href: 'https://www.mcgm.gov.in/irj/portal/anonymous/qlCLCComp', meta: t('about.gov.bmcComplaint.meta') },
          { label: t('about.gov.aaple.label'), href: 'https://aaplesarkar.mahaonline.gov.in/en', meta: t('about.gov.aaple.meta') },
          { label: t('about.gov.policeOnline.label'), href: 'https://mumbaipolice.gov.in/OnlineComplaints?ps_id=0', meta: t('about.gov.policeOnline.meta') }
        ]
      },
      {
        title: t('about.safety.title'),
        icon: <AlertTriangle size={26} />,
        accent: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        items: [
          { label: t('about.safety.flood.label'), href: 'https://dm.mcgm.gov.in/flood-preparedness-guidelines', meta: t('about.safety.flood.meta') },
          { label: t('about.safety.protocol.label'), href: 'https://ndma.gov.in/', meta: t('about.safety.protocol.meta') },
          { label: t('about.safety.awareness.label'), href: 'https://www.mcgm.gov.in/', meta: t('about.safety.awareness.meta') }
        ]
      }
    ],
    [t]
  );

  return (
    <div className="resources-page">
      <section className="resources-section">
        <div className="resources-header">
          <h1 className="resources-title">
            {t('about.title')}
          </h1>
          <p className="resources-subtitle">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="resources-grid">
          {resourceGroups.map((group) => (
            <article key={group.title} style={resourceCardStyle}>
              <div style={resourceHeaderStyle}>
                <div style={{ ...resourceIconWrapStyle, color: group.accent.split(',')[1].trim().replace(')', '') }}>{group.icon}</div>
                <h3 style={{ color: '#1e293b', fontSize: '20px', fontWeight: 800, lineHeight: 1.1 }}>{group.title}</h3>
              </div>
              <div className="resources-card-body">
                <div style={{ display: 'grid', gap: '12px' }}>
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="resource-link-btn"
                      style={{
                        borderColor: group.accent.split(',')[1].trim().replace(')', '') + '33',
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



export default About;

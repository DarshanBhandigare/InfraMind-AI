import React from 'react';
import { Globe, Shield, Target, Award, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="section-container" style={{ paddingTop: '120px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Mission InfraMind</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            We are bridging the gap between citizen awareness and municipal action using 
            advanced data science and AI.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '5rem' }}>
          <div className="glass-card">
            <Target size={32} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3>Our Goal</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              To reduce infrastructure-related accidents by 40% through predictive maintenance 
              and real-time hazard identification.
            </p>
          </div>
          <div className="glass-card">
            <Globe size={32} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3>Transparency</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Providing citizens with a clear view of their community's health and the 
              actions taken by authorities.
            </p>
          </div>
        </div>

        <div className="glass-effect" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Ready to make a difference?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Whether you are a concerned citizen or a municipal authority, InfraMind has 
            the tools you need to build a safer future.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem' }}>Join the Movement <ArrowRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

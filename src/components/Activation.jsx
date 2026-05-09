import React, { useState } from 'react';
import { setSupabaseConfig } from '../supabaseClient';
import { Key, Globe, ShieldCheck, ArrowRight, Server } from 'lucide-react';

const Activation = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !key) {
      setError('Harap isi semua field aktivasi.');
      return;
    }
    
    setLoading(true);
    try {
      // Basic validation
      new URL(url);
      setSupabaseConfig(url, key);
    } catch (err) {
      setError('Format URL tidak valid.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#020617',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Outfit", sans-serif', color: 'white',
      padding: '2rem'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px',
        background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px',
        background: 'var(--primary)', filter: 'blur(180px)', opacity: 0.05, pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%', maxWidth: '500px', background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(20px)', padding: '3.5rem', borderRadius: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Progress Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--primary)',
          width: loading ? '100%' : '30%', transition: 'width 2s ease-in-out'
        }}></div>

        <div style={{
          width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary)', borderRadius: '24px', margin: '0 auto 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
        }}>
          <ShieldCheck size={40} />
        </div>

        <h1 style={{fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em'}}>Kaze POS</h1>
        <p style={{color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontWeight: 500}}>Sistem belum teraktivasi. Masukkan kunci lisensi database untuk memulai.</p>

        <form onSubmit={handleSubmit} style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="activation-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
              <Globe size={14} /> Supabase Project URL
            </label>
            <div style={{position: 'relative'}}>
              <input 
                type="text" 
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
                style={{
                  width: '100%', padding: '1.2rem', paddingLeft: '1.5rem', background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: 'white',
                  fontSize: '1rem', outline: 'none', transition: 'all 0.2s'
                }}
              />
            </div>
          </div>

          <div className="activation-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
              <Key size={14} /> Project Anon Key
            </label>
            <div style={{position: 'relative'}}>
              <textarea 
                placeholder="eyJhbGciOiJIUzI1Ni..."
                value={key}
                onChange={e => setKey(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '1.2rem', paddingLeft: '1.5rem', background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: 'white',
                  fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s', resize: 'none'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '1rem', padding: '1.2rem', borderRadius: '16px', background: 'var(--primary)',
              color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.5)', transition: 'all 0.2s'
            }}
          >
            {loading ? 'MENYAMBUNGKAN...' : (
              <>AKTIFKAN SISTEM <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div style={{marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', opacity: 0.3}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700}}><Server size={12}/> SECURE NODE</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700}}><ShieldCheck size={12}/> ENCRYPTED</div>
        </div>
      </div>

      <style>{`
        input:focus, textarea:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Activation;

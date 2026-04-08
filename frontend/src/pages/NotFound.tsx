import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-deep)',
        color: 'var(--text-primary)',
        padding: '2rem',
        textAlign: 'center',
        gap: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: 'var(--lav)',
          filter: 'blur(120px)',
          opacity: 0.04,
          pointerEvents: 'none',
        }}
      />

      {/* 404 watermark */}
      <div
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-editorial)',
          fontSize: 'clamp(8rem, 20vw, 18rem)',
          fontWeight: 700,
          opacity: 0.04,
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 1,
          color: 'var(--text-primary)',
        }}
      >
        404
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-navigation)',
            fontSize: '0.6875rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--lav)',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Page not found
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            marginBottom: '1rem',
          }}
        >
          This route doesn't exist.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            color: 'var(--text-sec)',
            maxWidth: 420,
            lineHeight: 1.75,
          }}
        >
          The page you're looking for has been moved, deleted, or never existed in the first place.
        </p>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            fontFamily: 'var(--font-navigation)',
            fontWeight: 500,
            fontSize: '0.875rem',
            padding: '10px 20px',
            background: 'transparent',
            color: 'var(--lav)',
            border: '1px solid var(--lav-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background 250ms ease',
          }}
        >
          <ArrowLeft size={16} />
          Go back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            fontFamily: 'var(--font-navigation)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            letterSpacing: '0.03em',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, var(--lav), var(--lav-dim))',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--lav-glow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Home size={16} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

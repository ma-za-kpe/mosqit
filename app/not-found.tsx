import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontSize: '100px', marginBottom: '20px' }}>🦟</div>
      <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>404</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>Page Not Found</p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '18px',
          transition: 'background-color 0.3s'
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
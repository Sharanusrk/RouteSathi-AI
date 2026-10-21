import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('RouteSathi app error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
          <section role="alert" style={{ width: 'min(100%, 420px)', padding: '32px 24px', border: '1px solid #e2e8f0', borderRadius: 24, background: '#fff', textAlign: 'center', boxShadow: '0 16px 48px rgba(15,23,42,.08)' }}>
            <div aria-hidden="true" style={{ fontSize: 40 }}>🧭</div>
            <h1 style={{ margin: '16px 0 8px', fontSize: 24, lineHeight: 1.2 }}>This page hit a problem</h1>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>Reload RouteSathi to try again.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 24, border: 0, borderRadius: 12, background: '#245c4a', color: '#fff', padding: '14px 22px', font: '600 15px system-ui', cursor: 'pointer' }}>Reload page</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);

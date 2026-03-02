import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Catch any errors during module loading
const root = document.getElementById('root')!;

async function bootstrap() {
  try {
    const { default: App } = await import('./App.tsx');
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error('FATAL: Failed to mount app:', err);
    root.innerHTML = `
      <div style="padding:40px;font-family:monospace;color:red;">
        <h1>App failed to load</h1>
        <pre>${err instanceof Error ? err.stack : String(err)}</pre>
      </div>
    `;
  }
}

bootstrap();

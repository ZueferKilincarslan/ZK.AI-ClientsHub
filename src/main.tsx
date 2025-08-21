import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;

// For pre-rendering: check if we're in a browser environment
if (typeof window !== 'undefined') {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Signal that rendering is complete for pre-rendering
  setTimeout(() => {
    document.dispatchEvent(new Event('render-event'));
  }, 1500);
}

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';
import { ErrorBoundary } from './components/ErrorBoundary';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

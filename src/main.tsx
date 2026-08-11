import {StrictMode} from 'react';
import {getSavedQuality} from './utils/performance';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.documentElement.classList.toggle('low-performance', getSavedQuality() === 'LOW');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

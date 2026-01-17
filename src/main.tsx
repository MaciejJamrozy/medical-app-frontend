import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. TUTAJ IMPORTUJEMY STYLE - to się nie zmienia
import './index.css'; 
import App from './App';

// 2. TypeScript: Dodajemy wykrzyknik (!), bo jesteśmy pewni, że div 'root' istnieje w HTML
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Nie znaleziono elementu root w index.html");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
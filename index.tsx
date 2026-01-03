
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Entry point for StatArch
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Root element 'root' not found in index.html. StatArch cannot mount.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("StatArch: System Initialized.");

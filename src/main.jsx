import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from "@/components/theme-provider";
import './index.css';

const Root = () => {
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setHeight();

    window.addEventListener('resize', setHeight);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', setHeight);
    };
  }, []);

  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <main className='h-screen-with-url-bar'>
          <App />
        </main>
      </ThemeProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);

import 'regenerator-runtime/runtime';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import './index.scss';
import './PhaserGame';
import muiTheme from './MuiTheme';
import App from './App';
import store from './stores';

const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      let idToken = localStorage.getItem('idToken');

      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('idToken');

      if (urlToken) {
        localStorage.setItem('idToken', urlToken);
        idToken = urlToken;
        // Remove the token from the URL
        urlParams.delete('idToken');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (!idToken) {
        navigateToOnboarding();
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/check-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          navigateToOnboarding();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigateToOnboarding();
      } finally {
        setLoading(false);
      }
    };

    const navigateToOnboarding = () => {
      const onboardingUrl = new URL('http://localhost:3002/onboarding');
      onboardingUrl.searchParams.set('redirect', window.location.href);
      window.location.href = onboardingUrl.toString();
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return isAuthenticated ? <App /> : null;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AuthWrapper />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

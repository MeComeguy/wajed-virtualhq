import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './onboarding.css';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [notification, setNotification] = useState(null);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const idToken = localStorage.getItem('idToken');
      if (idToken) {
        try {
          const response = await fetch('http://localhost:3001/check-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });
          const data = await response.json();
          if (data.authenticated) {
            const mainAppUrl = new URL('http://localhost:5173');
            window.location.href = mainAppUrl.toString();
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    switch (step) {
      case 1:
        if (name) setStep(2);
        break;
      case 2:
        if (isValidEmail(email)) {
          setShowEmailError(false);
          setStep(3);
        } else {
          setShowEmailError(true);
        }
        break;
      case 3:
        if (password.length >= 6) {
          setShowPasswordError(false);
          setStep(4);
        } else {
          setShowPasswordError(true);
        }
        break;
      default:
        setStep(step + 1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const formData = { name, email, password, organization };
  
    try {
      const response = await fetch('http://localhost:3001/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.message === 'Verification email sent!') {
        setNotification(data.details);
  
        try {
          const signInResponse = await fetch('http://localhost:3001/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: data.customToken }),
          });
          const signInData = await signInResponse.json();
          if (signInData.authenticated) {
            localStorage.setItem('idToken', data.customToken);
            setStep(5);
            const mainAppUrl = new URL('http://localhost:5173');
            mainAppUrl.searchParams.set('idToken', data.customToken);
            window.location.href = mainAppUrl.toString();
          }
        } catch (error) {
          console.error('Error signing in with custom token:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const handleGetStarted = () => {
    const mainAppUrl = new URL('http://localhost:5173');
    window.location.href = mainAppUrl.toString();
    };

  return (
    <div className="Onboarding">
      <header className="Onboarding-header">
        {step === 1 && <h2>Glad to see you here again 🤩</h2>}
        <div className="container">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-control">
                <input
                  className="input input-alt"
                  placeholder="Type your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  type="text"
                />
                <button type="button" onClick={handleNext}>Next</button>
              </div>
            )}
            {step === 2 && (
              <div className="form-control">
                {showEmailError && <p className="error">Please enter a valid email address</p>}
                <input
                  className="input input-alt"
                  placeholder="Type your email"
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="button" onClick={handleNext}>Next</button>
              </div>
            )}
            {step === 3 && (
              <div className="form-control">
                {showPasswordError && <p className="error">Your password should have at least 6 characters</p>}
                <input
                  className="input input-alt"
                  placeholder="Please insert your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={handleNext}>Next</button>
              </div>
            )}
            {step === 4 && (
              <div className="form-control">
                <input
                  className="input input-alt"
                  placeholder="Type your organization name"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
                <button type="submit">Submit</button>
              </div>
            )}
            {step === 5 && notification && (
              <div className="form-control">
                <p className="h1">{notification.title} ✔️</p>
                <button type="button" onClick={handleGetStarted}>Get Started 🚀</button>
              </div>
            )}
          </form>
        </div>
      </header>
    </div>
  );
}

export default Onboarding;

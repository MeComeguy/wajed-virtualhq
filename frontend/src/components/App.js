import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className='helloMessage'>Hello 👋!</h1>
        <p className='welcomeMessage'> Welcome to Wajed the first Virtual Headquarter 🏢 in Africa 🌍!</p>
        <Link to="/onboarding" className="button">
          Get started
          <span className="button-span"> ─ it's free</span>
        </Link>
      </header>
    </div>
  );
}

export default App;
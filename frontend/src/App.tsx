import React, { useEffect } from 'react';
import './App.css';
import { ModernAuthUI } from './components/ModernAuthUI';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.email);
        
      } else {
        console.log('User is signed out');
        
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Concoevents</h1>
        <p>Welcome to the Campus Events platform!</p>
        <ModernAuthUI />
        <p>Backend API is running and ready to serve requests.</p>
        <p>Frontend is working correctly!</p>
        
      </header>
    </div>
  );
}

export default App;

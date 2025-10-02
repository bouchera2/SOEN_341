import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function ModernAuthUI() {
  const { user, loading, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        
        alert('Account created successfully!');
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
        
        alert('Welcome back!');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      
      alert('Signed in with Google successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <h3>Welcome, {user.email}!</h3>
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
      
      <div>
        <button onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
      
      <div>
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}

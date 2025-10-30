/*import React, { useState } from "react";
import { auth, googleProvider } from "../services/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const ModernAuthUI: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    setError(null);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="modern-auth">
      <h2 className="auth-title">
        {isSignup ? "Create an Account" : "Welcome Back"}
      </h2>

      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

      <button className="gradient-btn" onClick={handleEmailAuth}>
        {isSignup ? "Sign Up" : "Sign In"}
      </button>

      { ✅ OFFICIAL GOOGLE SIGN-IN BUTTON }
      <button className="google-btn" onClick={handleGoogleSignIn}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="google-logo"
        />
        Continue with Google
      </button>

      <div className="auth-footer">
        {isSignup ? (
          <p>
            Already have an account?{" "}
            <a href="#" onClick={() => setIsSignup(false)}>
              Sign In
            </a>
          </p>
        ) : (
          <p>
            Don’t have an account?{" "}
            <a href="#" onClick={() => setIsSignup(true)}>
              Sign Up
            </a>
          </p>
        )}
      </div>
    </div>
  );
};*/

import React, { useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "../services/firebase";

export const ModernAuthUI: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    setError(null);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="modern-auth">
      <h2 className="auth-title">
        {isSignup ? "Create an Account" : "Welcome Back"}
      </h2>

      <input
        className="auth-input"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

      <button className="gradient-btn" onClick={handleEmailAuth}>
        {isSignup ? "Sign Up" : "Sign In"}
      </button>

      <button className="google-btn" onClick={handleGoogleSignIn}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="google-logo"
        />
        Continue with Google
      </button>

      <div className="auth-footer">
        {isSignup ? (
          <p>
            Already have an account?{" "}
            <a href="#" onClick={() => setIsSignup(false)}>
              Sign In
            </a>
          </p>
        ) : (
          <p>
            Don’t have an account?{" "}
            <a href="#" onClick={() => setIsSignup(true)}>
              Sign Up
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

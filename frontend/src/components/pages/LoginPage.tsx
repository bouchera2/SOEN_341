import React from 'react';
import { motion } from 'framer-motion';
import { ModernAuthUI } from '../ModernAuthUI';

const LoginPage: React.FC = () => {
  return (
    <div className="App login-layout">
      {/* CENTERED LOGIN FORM */}
      <div className="login-container">
        <motion.div
          className="login-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="app-logo">
            <div className="app-logo-icon">C</div>
            <span className="app-logo-text">CUEvents</span>
          </div>
          
          <h1 className="app-title">CUEvents</h1>
          <p className="app-subtitle">Your Gateway to Campus Happenings 🎉</p>
          <p className="app-subtitle">See you at any Concordia Event!</p>

          <motion.div
            className="auth-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          >
            <ModernAuthUI />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

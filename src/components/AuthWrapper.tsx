import React, { useState } from 'react';
import { SignInView } from './SignInView';
import { SignUpView } from './SignUpView';
import { ForgotPasswordView } from './ForgotPasswordView';

interface AuthWrapperProps {
  onAuthenticated: () => void;
}

export function AuthWrapper({ onAuthenticated }: AuthWrapperProps) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const handleSignIn = async (email: string, password: string) => {
    // Simulate authentication API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would validate credentials here
    // For demo purposes, we'll accept any valid email/password
    if (email && password.length >= 6) {
      // Store authentication state
      localStorage.setItem('vietnamese-money-tracker-auth', JSON.stringify({
        isAuthenticated: true,
        email,
        loginTime: new Date().toISOString()
      }));
      
      onAuthenticated();
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    // Simulate user registration API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store user profile
    localStorage.setItem('vietnamese-money-tracker-profile', JSON.stringify({
      fullName,
      email,
      createdAt: new Date().toISOString()
    }));
    
    // Auto sign in after successful registration
    await handleSignIn(email, password);
  };

  const handleForgotPassword = async (email: string) => {
    // Simulate password reset API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would send an actual email
    console.log(`Password reset email sent to: ${email}`);
  };

  switch (currentView) {
    case 'signup':
      return (
        <SignUpView
          onSignUp={handleSignUp}
          onSignIn={() => setCurrentView('signin')}
        />
      );
    
    case 'forgot':
      return (
        <ForgotPasswordView
          onBack={() => setCurrentView('signin')}
          onResetPassword={handleForgotPassword}
        />
      );
    
    default:
      return (
        <SignInView
          onSignIn={handleSignIn}
          onForgotPassword={() => setCurrentView('forgot')}
          onSignUp={() => setCurrentView('signup')}
        />
      );
  }
}
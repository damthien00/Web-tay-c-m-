import React, { useState } from 'react';
import { SignInView } from './SignInView';
import { SignUpView } from './SignUpView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ResetPasswordView } from './ResetPasswordView';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-client';
import { requestPasswordResetAction, resetPasswordAction } from '@/actions/auth/password';

interface AuthWrapperProps {
  onAuthenticated: () => void;
}

export function AuthWrapper({ onAuthenticated }: AuthWrapperProps) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get('token') || null;

  const getViewFromPath = (): 'signin' | 'signup' | 'forgot' | 'reset' | null => {
    if (!pathname || !pathname.startsWith('/auth')) return null;
    const segments = pathname.split('/').filter(Boolean);
    const sub = segments[1]; // after 'auth'
    switch (sub) {
      case 'sign-in':
        return 'signin';
      case 'sign-up':
        return 'signup';
      case 'forgot-password':
        return 'forgot';
      case 'reset-password':
        return 'reset';
      default:
        return 'signin';
    }
  };

  const routeView = getViewFromPath();
  const view: 'signin' | 'signup' | 'forgot' | 'reset' = routeView || currentView;

  const navigateTo = (v: 'signin' | 'signup' | 'forgot' | 'reset') => {
    const map = {
      signin: '/auth/sign-in',
      signup: '/auth/sign-up',
      forgot: '/auth/forgot-password',
      reset: '/auth/reset-password',
    } as const;

    if (pathname && pathname.startsWith('/auth')) {
      router.push(map[v]);
    } else {
      setCurrentView(v);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const response = await signIn.email({ email, password });
    if (response?.error) {
      throw new Error(response.error.message || 'Đăng nhập thất bại');
    }
    // Optionally reflect auth in local store for the app demo state
    try { useAuthStore.getState().signIn(email); } catch {}
    onAuthenticated?.();
    // Follow existing auth pages behavior
    router.push('/admin');
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    const response = await signUp.email({ email, password, name: fullName });
    if (response?.error) {
      throw new Error(response.error.message || 'Không thể tạo tài khoản');
    }
    // Optionally sync local profile store for demo UI
    try {
      useAppStore.getState().setProfile({
        fullName,
        email,
        phone: '',
        location: '',
        occupation: '',
        birthDate: '',
        avatar: undefined,
      });
    } catch {}
    onAuthenticated?.();
    router.push('/admin');
  };

  const handleForgotPassword = async (email: string) => {
    const result = await requestPasswordResetAction(email);
    if (!result.ok) {
      throw new Error(result.error || 'Không thể gửi email đặt lại mật khẩu');
    }
  };

  const handleResetPassword = async (resetToken: string, newPassword: string) => {
    const result = await resetPasswordAction(resetToken, newPassword);
    if (!result.ok) {
      throw new Error(result.error || 'Không thể đặt lại mật khẩu');
    }
    // After successful reset, send user back to sign-in
    router.push('/auth/sign-in');
  };

  switch (view) {
    case 'signup':
      return (
        <SignUpView
          onSignUp={handleSignUp}
          onSignIn={() => navigateTo('signin')}
        />
      );

    case 'forgot':
      return (
        <ForgotPasswordView
          onBack={() => navigateTo('signin')}
          onResetPassword={handleForgotPassword}
        />
      );

    case 'reset':
      return (
        <ResetPasswordView
          token={token}
          onBack={() => navigateTo('signin')}
          onResetPassword={handleResetPassword}
        />
      );

    default:
      return (
        <SignInView
          onSignIn={handleSignIn}
          onForgotPassword={() => navigateTo('forgot')}
          onSignUp={() => navigateTo('signup')}
        />
      );
  }
}

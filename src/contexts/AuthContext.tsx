import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { UserProfile } from '../types';
import { getStoredUser, storeUser, removeStoredUser } from '../services/storage';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextData {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithQuickGoogle: (name: string, email: string, photoUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isGoogleConfigured: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Read environment variable client IDs if provided by the developer
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;

  const isGoogleConfigured = Boolean(webClientId || androidClientId || iosClientId);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || 'none',
    androidClientId: androidClientId || 'none',
    iosClientId: iosClientId || 'none',
  });

  // Load persisted user on app startup from local storage
  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await getStoredUser();
        if (stored) {
          setUser(stored);
        }
      } catch (err) {
        console.error('Failed to load user from storage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // Handle Google OAuth response if user used the real OAuth flow
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      fetchGoogleUserProfile(response.authentication.accessToken);
    }
  }, [response]);

  async function fetchGoogleUserProfile(token: string) {
    try {
      setIsLoading(true);
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleData = await res.json();

      const profile: UserProfile = {
        id: googleData.id || `google_${Date.now()}`,
        name: googleData.name || 'Usuário Google',
        email: googleData.email || '',
        photoUrl: googleData.picture,
        loginMethod: 'google',
        createdAt: new Date().toISOString(),
      };

      await storeUser(profile);
      setUser(profile);
    } catch (error) {
      console.error('Error fetching Google profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (isGoogleConfigured) {
      await promptAsync();
    } else {
      // In development or when client IDs are not yet registered,
      // fallback smoothly to user input dialog / quick login
      throw new Error('CONFIG_REQUIRED');
    }
  }

  async function signInWithQuickGoogle(name: string, email: string, photoUrl?: string) {
    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: `google_user_${Date.now()}`,
        name: name.trim() || 'Usuário Google',
        email: email.trim().toLowerCase(),
        photoUrl: photoUrl || undefined,
        loginMethod: 'google',
        createdAt: new Date().toISOString(),
      };

      await storeUser(profile);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      await removeStoredUser();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInWithQuickGoogle,
        signOut,
        isGoogleConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

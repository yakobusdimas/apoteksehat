import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import authAPI, { UserProfile, RegisterData } from '../services/authAPI';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9]{9,13}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password terlalu panjang.' };
  }
  return { valid: true };
}

export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return PHONE_REGEX.test(cleaned);
}

export function isUserProfileIncomplete(user: UserProfile | null): boolean {
  if (!user) return false;
  return !user.phone?.trim() || !user.address?.trim();
}

export interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  loginWithGoogle: (token: string) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProfileIncomplete: boolean;
  isLoading: boolean;  // true while checking session on mount
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to prevent flash

  // Restore session on mount — use cached user first, then validate token in background
  useEffect(() => {
    async function restoreSession() {
      if (authAPI.hasToken()) {
        const cached = authAPI.getCachedUser();
        if (cached) {
          setUser(cached);
        }
        try {
          const result = await authAPI.getProfile();
          if (result.success && result.user) {
            setUser(result.user);
          } else if (result.message?.includes('Token expired') || result.message?.includes('Invalid token')) {
            // Only logout if explicitly unauthenticated (401)
            authAPI.logout();
            setUser(null);
          }
        } catch {
          // Network fail — keep cached user so session is not lost!
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string, _remember = false) => {
    const trimmedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, message: 'Email dan password wajib diisi.' };
    }

    const result = await authAPI.login(trimmedEmail, trimmedPassword);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    return { success: false, message: result.message || 'Login gagal.' };
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    const result = await authAPI.loginWithGoogle(token);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    return { success: false, message: result.message || 'Login dengan Google gagal.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (!data.name.trim() || !data.email.trim() || !data.password) {
      return { success: false, message: 'Nama, email, dan password wajib diisi.' };
    }

    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
      return { success: false, message: passwordCheck.message };
    }

    const result = await authAPI.register({
      name: data.name.trim(),
      email: normalizeEmail(data.email),
      password: data.password,
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
    });

    if (result.success && result.user) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    return { success: false, message: result.message || 'Pendaftaran gagal.' };
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return { success: false, message: 'User belum login.' };

    try {
      const result = await authAPI.updateProfile(data);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, message: result.message || 'Gagal memperbarui profil.' };
    } catch {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }, [user]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isProfileIncomplete: isUserProfileIncomplete(user),
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

import { create } from 'zustand';
import { postRequest, ApiError } from '../../../shared/api/apiClient';
import { saveToken, getToken, deleteToken } from '../../../shared/auth/tokenService';
import { decodeJwt } from '../../../shared/auth/jwtDecoder';
import { registerForPushNotificationsAsync, unregisterPushNotificationsAsync } from '../../../shared/notifications/pushNotificationHelper';

export interface UserClaims {
  sub?: string;
  firstName?: string;
  lastName?: string;
  areaName?: string | string[];
  shiftName?: string;
  role?: string;
  [key: string]: unknown;
}

interface LoginResponse {
  token?: string;
  Token?: string;
}

interface AuthState {
  token: string | null;
  user: UserClaims | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, PIN: string) => Promise<string>;
  logout: () => Promise<void>;
  verifySession: () => Promise<string | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  login: async (identifier: string, PIN: string) => {
    set({ loading: true, error: null });
    try {
      const response = await postRequest<{ Identifier: string; Password: string }, LoginResponse>(
        '/api/authentication/login',
        {
          Identifier: identifier,
          Password: PIN,
        }
      );
      const tokenVal = response?.token || response?.Token;
      if (!tokenVal) {
        throw new Error('Authentication response did not contain a valid session token.');
      }
      await saveToken(tokenVal);
      const decoded = decodeJwt(tokenVal) as UserClaims | null;
      set({ token: tokenVal, user: decoded, loading: false });
      
      registerForPushNotificationsAsync().catch((err) =>
        console.error('Failed to register push token after login:', err)
      );

      return tokenVal;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      if (apiErr.errors) {
        const firstErrorKey = Object.keys(apiErr.errors)[0];
        const messages = apiErr.errors[firstErrorKey];
        errorMessage = messages && messages.length > 0 ? messages[0] : apiErr.message;
      } else if (apiErr.message) {
        errorMessage = apiErr.message;
      }
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await unregisterPushNotificationsAsync();
    } catch {
      // Ignored for logout resilience
    }
    try {
      await postRequest('/api/authentication/logout', {});
    } catch {
      // Ignored for logout resilience
    }
    try {
      await deleteToken();
    } catch {
      // Ignored for logout resilience
    }
    set({ token: null, user: null, loading: false, error: null });
  },

  verifySession: async () => {
    set({ loading: true, error: null });
    try {
      const cachedToken = await getToken();
      if (!cachedToken) {
        set({ token: null, user: null, loading: false });
        return null;
      }
      const decoded = decodeJwt(cachedToken) as UserClaims | null;
      set({ token: cachedToken, user: decoded, loading: false });

      registerForPushNotificationsAsync().catch((err) =>
        console.error('Failed to refresh push token during verifySession:', err)
      );

      return cachedToken;
    } catch {
      await deleteToken();
      set({ token: null, user: null, loading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

import { useState, useEffect } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { IncidentListScreen } from './features/incidents/IncidentListScreen';
import { getToken, deleteToken } from './shared/auth/tokenService';
import { decodeJwt } from './shared/auth/jwtDecoder';
import './shared/theme/index.css';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const cachedToken = await getToken();
        if (cachedToken) {
          const decoded = decodeJwt(cachedToken);
          if (decoded) {
            setToken(cachedToken);
            setUser(decoded);
          } else {
            await deleteToken();
          }
        }
      } catch {
        await deleteToken();
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const handleLoginSuccess = (newToken: string, decodedUser: Record<string, unknown> | null) => {
    setToken(newToken);
    setUser(decodedUser);
  };

  const handleLogout = async () => {
    await deleteToken();
    setToken(null);
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="opscore-list-loading" data-testid="app-initializing">
        <span className="opscore-spinner opscore-spinner-large" />
      </div>
    );
  }

  if (!token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return <IncidentListScreen user={user} onLogout={handleLogout} />;
}

export default App;

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { 
  IBMPlexSans_400Regular, 
  IBMPlexSans_500Medium 
} from '@expo-google-fonts/ibm-plex-sans';
import { 
  IBMPlexMono_500Medium 
} from '@expo-google-fonts/ibm-plex-mono';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { OperatorDashboardScreen } from './src/features/operator/screens/OperatorDashboardScreen';
import { OperatorNewIncidentStep1Screen } from './src/features/operator/screens/OperatorNewIncidentStep1Screen';
import { OperatorNewIncidentStep2Screen } from './src/features/operator/screens/OperatorNewIncidentStep2Screen';
import { OperatorTicketDetailScreen } from './src/features/operator/screens/OperatorTicketDetailScreen';
import { SupervisorDashboardScreen } from './src/features/supervisor/screens/SupervisorDashboardScreen';
import { SupervisorTicketDetailScreen } from './src/features/supervisor/screens/SupervisorTicketDetailScreen';
import { TechnicianDashboardScreen } from './src/features/technician/screens/TechnicianDashboardScreen';
import { TechnicianTicketDetailScreen } from './src/features/technician/screens/TechnicianTicketDetailScreen';
import { TechnicianCloseTicketScreen } from './src/features/technician/screens/TechnicianCloseTicketScreen';
import { useAuthStore } from './src/features/auth/stores/useAuthStore';
import { useIncidentStore } from './src/features/incidents/stores/useIncidentStore';
import designTokens from './src/shared/theme/designTokens.json';

import { decodeJwt } from './src/shared/auth/jwtDecoder';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/shared/notifications/pushNotificationHelper';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

interface IncidentFormState {
  areaId: number;
  incidentTypeId: number;
  severityTypeId: number;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'IBMPlexSans': IBMPlexSans_400Regular,
    'IBMPlexSans-Medium': IBMPlexSans_500Medium,
    'IBMPlexMono': IBMPlexMono_500Medium,
    'IBMPlexMono-Medium': IBMPlexMono_500Medium,
  });

  const { token, loading, verifySession, logout } = useAuthStore();
  const createIncident = useIncidentStore((state) => state.createIncident);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'new-incident-step1' | 'new-incident-step2' | 'incident-detail' | 'supervisor-dashboard' | 'supervisor-ticket-detail' | 'technician-dashboard' | 'technician-ticket-detail' | 'technician-close-ticket'>('home');
  const [newIncidentForm, setNewIncidentForm] = useState<IncidentFormState | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const getInitialScreenForToken = (tokenStr: string | null): 'home' | 'supervisor-dashboard' | 'technician-dashboard' => {
    if (!tokenStr) return 'home';
    try {
      const decoded = decodeJwt(tokenStr);
      if (decoded) {
        const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role === 'Supervisor') {
          return 'supervisor-dashboard';
        }
        if (role === 'Technician') {
          return 'technician-dashboard';
        }
      }
    } catch {
      // fallback to home
    }
    return 'home';
  };

  const navigateToIncidentDetail = (tokenStr: string | null, incidentId: string) => {
    if (!tokenStr) return;
    try {
      const decoded = decodeJwt(tokenStr);
      if (decoded) {
        const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        setSelectedIncidentId(incidentId);
        if (role === 'Supervisor') {
          setCurrentScreen('supervisor-ticket-detail');
        } else if (role === 'Technician') {
          setCurrentScreen('technician-ticket-detail');
        } else {
          setCurrentScreen('incident-detail');
        }
      }
    } catch (err) {
      console.error('Failed to navigate from notification:', err);
    }
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const incidentId = response.notification.request.content.data?.incidentId as string | undefined;
      if (incidentId) {
        navigateToIncidentDetail(token, incidentId);
      }
    });

    if (token) {
      registerForPushNotificationsAsync().catch(err => {
        console.error('Failed to register push token on launch:', err);
      });
    }

    return () => {
      subscription.remove();
    };
  }, [token]);

  useEffect(() => {
    const checkToken = async () => {
      const cachedToken = await verifySession();
      if (cachedToken) {
        setCurrentScreen(getInitialScreenForToken(cachedToken));
      } else {
        setCurrentScreen('home');
      }
    };
    checkToken();
  }, [verifySession]);

  useEffect(() => {
    if (token) {
      useIncidentStore.getState().startSignalR().catch((err) => {
        console.error('Failed to start SignalR:', err);
      });
    } else {
      useIncidentStore.getState().stopSignalR().catch((err) => {
        console.error('Failed to stop SignalR:', err);
      });
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    setCurrentScreen(getInitialScreenForToken(newToken));
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('home');
  };

  const handleReportPress = () => {
    setCurrentScreen('new-incident-step1');
  };

  const handleStep1Back = () => {
    setCurrentScreen('home');
  };

  const handleStep1Close = () => {
    setCurrentScreen('home');
  };

  const handleStep1Next = (areaId: number, incidentTypeId: number, severityTypeId: number) => {
    setNewIncidentForm({ areaId, incidentTypeId, severityTypeId });
    setCurrentScreen('new-incident-step2');
  };

  const handleStep2Back = () => {
    setCurrentScreen('new-incident-step1');
  };

  const handleStep2Close = () => {
    setCurrentScreen('home');
  };

  const handleStep2Submit = async (description: string) => {
    try {
      const response = await createIncident({
        AreaId: newIncidentForm?.areaId,
        IncidentTypeId: newIncidentForm?.incidentTypeId,
        SeverityTypeId: newIncidentForm?.severityTypeId,
        Description: description,
        DeviceTimestamp: new Date().toISOString(),
      });

      if (response && response.incidentId) {
        setSelectedIncidentId(response.incidentId);
        setCurrentScreen('incident-detail');
      } else {
        setCurrentScreen('home');
      }
    } catch {
      setCurrentScreen('home');
    }
  };

  const renderContent = () => {
    if (loading || !fontsLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={designTokens.colors['text-on-dark']} />
        </View>
      );
    }

    if (!token) {
      return (
        <>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'new-incident-step1') {
      return (
        <>
          <OperatorNewIncidentStep1Screen
            onBack={handleStep1Back}
            onClose={handleStep1Close}
            onNext={handleStep1Next}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'new-incident-step2') {
      return (
        <>
          <OperatorNewIncidentStep2Screen
            onBack={handleStep2Back}
            onClose={handleStep2Close}
            onSubmit={handleStep2Submit}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'incident-detail') {
      return (
        <>
          <OperatorTicketDetailScreen
            incidentId={selectedIncidentId || ''}
            onBack={() => setCurrentScreen('home')}
            onClose={() => setCurrentScreen('home')}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'supervisor-dashboard') {
      return (
        <>
          <SupervisorDashboardScreen
            onTicketPress={(id) => {
              setSelectedIncidentId(id);
              setCurrentScreen('supervisor-ticket-detail');
            }}
            onMenuPress={() => {}}
            onLogout={handleLogout}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'supervisor-ticket-detail') {
      return (
        <>
          <SupervisorTicketDetailScreen
            ticketId={selectedIncidentId || ''}
            onBack={() => setCurrentScreen('supervisor-dashboard')}
            onClose={() => setCurrentScreen('supervisor-dashboard')}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'technician-dashboard') {
      return (
        <>
          <TechnicianDashboardScreen
            onTicketPress={(id) => {
              setSelectedIncidentId(id);
              setCurrentScreen('technician-ticket-detail');
            }}
            onLogout={handleLogout}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'technician-ticket-detail') {
      return (
        <>
          <TechnicianTicketDetailScreen
            ticketId={selectedIncidentId || ''}
            onBack={() => setCurrentScreen('technician-dashboard')}
            onResolve={() => {
              setCurrentScreen('technician-close-ticket');
            }}
          />
          <StatusBar style="light" />
        </>
      );
    }

    if (currentScreen === 'technician-close-ticket') {
      return (
        <>
          <TechnicianCloseTicketScreen
            ticketId={selectedIncidentId || ''}
            onBack={() => setCurrentScreen('technician-ticket-detail')}
            onCloseTicket={() => {
              setCurrentScreen('technician-dashboard');
            }}
          />
          <StatusBar style="light" />
        </>
      );
    }

    return (
      <>
        <OperatorDashboardScreen 
          onReportPress={handleReportPress} 
          onLogout={handleLogout} 
          onIncidentPress={(id) => {
            setSelectedIncidentId(id);
            setCurrentScreen('incident-detail');
          }}
        />
        <StatusBar style="light" />
      </>
    );
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: designTokens.colors['background-dark'],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

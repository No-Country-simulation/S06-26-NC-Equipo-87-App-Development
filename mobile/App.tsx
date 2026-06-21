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
import { OperatorHomeScreen } from './src/features/incidents/screens/OperatorHomeScreen';
import { NewIncidentStep1Screen } from './src/features/incidents/screens/NewIncidentStep1Screen';
import { NewIncidentStep2Screen } from './src/features/incidents/screens/NewIncidentStep2Screen';
import { IncidentDetailScreen } from './src/features/incidents/screens/IncidentDetailScreen';
import { getToken } from './src/shared/auth/tokenService';
import { postRequest } from './src/shared/api/apiClient';
import designTokens from './src/shared/theme/designTokens.json';

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

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'new-incident-step1' | 'new-incident-step2' | 'incident-detail'>('home');
  const [newIncidentForm, setNewIncidentForm] = useState<IncidentFormState | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const cachedToken = await getToken();
        setToken(cachedToken);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
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
      const response = await postRequest<{
        AreaId: number | undefined;
        IncidentTypeId: number | undefined;
        SeverityTypeId: number | undefined;
        Description: string;
        DeviceTimestamp: string;
      }, { incidentId: string }>('/api/incidents', {
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
          <NewIncidentStep1Screen
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
          <NewIncidentStep2Screen
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
          <IncidentDetailScreen
            incidentId={selectedIncidentId || ''}
            onBack={() => setCurrentScreen('home')}
            onClose={() => setCurrentScreen('home')}
          />
          <StatusBar style="light" />
        </>
      );
    }

    return (
      <>
        <OperatorHomeScreen 
          onReportPress={handleReportPress} 
          onLogout={() => setToken(null)} 
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

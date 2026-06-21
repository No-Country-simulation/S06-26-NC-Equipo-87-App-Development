import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TopBar } from '../../../shared/components/organisms/TopBar';
import { ProfileMenu } from '../../../shared/components/molecules/ProfileMenu';
import { ReportButton } from '../../../shared/components/molecules/ReportButton';
import { IncidentList } from '../../../shared/components/organisms/IncidentList';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Button } from '../../../shared/components/atoms/Button';
import { getRequest, postRequest } from '../../../shared/api/apiClient';
import { getToken, deleteToken } from '../../../shared/auth/tokenService';
import { decodeJwt } from '../../../shared/auth/jwtDecoder';
import designTokens from '../../../shared/theme/designTokens.json';

interface BackendIncident {
  incidentId: string;
  description: string;
  areaId: number;
  areaName: string;
  incidentTypeId: number;
  incidentTypeName: string;
  severityTypeId: number;
  severityTypeName: string;
  status: string;
  reportedByUserId: string;
  reportedDate: string;
}

const mapStatusToLabel = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'in-progress') {
    return 'En proceso';
  }
  if (normalized === 'closed') {
    return 'Cerrado';
  }
  return 'Abierto';
};

const mapStatusToType = (status: string): 'open' | 'in-progress' | 'closed' => {
  const normalized = status.toLowerCase();
  if (normalized === 'in-progress' || normalized === 'closed') {
    return normalized;
  }
  return 'open';
};

interface OperatorHomeScreenProps {
  onReportPress?: () => void;
  onLogout?: () => void;
}

interface MappedHomeIncident {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'closed';
  statusLabel: string;
}

interface UserClaims {
  sub?: string;
  firstName?: string;
  lastName?: string;
  areaName?: string;
  shiftName?: string;
  role?: string;
  [key: string]: unknown;
}

export const OperatorHomeScreen: React.FC<OperatorHomeScreenProps> = ({ onReportPress, onLogout }) => {
  const [userName, setUserName] = useState<string>('Usuario');
  const [userRole, setUserRole] = useState<string>('Operador');
  const [userLine, setUserLine] = useState<string>('Sin área');
  const [userShift, setUserShift] = useState<string>('Sin turno');
  const [incidents, setIncidents] = useState<MappedHomeIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const fetchUserDataAndIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cachedToken = await getToken();
      if (!cachedToken) {
        throw new Error('No valid authentication session found.');
      }

      const decodedClaims = decodeJwt(cachedToken) as UserClaims | null;
      let userId = '';
      if (decodedClaims) {
        userId = decodedClaims.sub || '';
        const rawFirstName = decodedClaims.firstName || '';
        const rawLastName = decodedClaims.lastName || '';
        if (rawFirstName) {
          const lastNameInitial = rawLastName ? ` ${rawLastName.charAt(0)}.` : '';
          setUserName(`${rawFirstName}${lastNameInitial}`);
        }
        if (decodedClaims.areaName) {
          setUserLine(decodedClaims.areaName);
        }
        if (decodedClaims.shiftName) {
          setUserShift(decodedClaims.shiftName);
        }

        const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const roleValue = (decodedClaims[roleClaim] as string) || decodedClaims.role;
        if (roleValue) {
          setUserRole(roleValue);
        }
      }

      const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const backendIncidents = await getRequest<BackendIncident[]>(
        `/api/incidents?reportedByUserId=${encodeURIComponent(userId)}&since=${encodeURIComponent(sinceDate)}`
      );

      const mappedIncidents: MappedHomeIncident[] = backendIncidents.map((item) => ({
        id: item.incidentId,
        title: item.incidentTypeName || item.description || 'Incidente',
        status: mapStatusToType(item.status),
        statusLabel: mapStatusToLabel(item.status),
      }));

      setIncidents(mappedIncidents);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDataAndIncidents();
  }, [fetchUserDataAndIncidents]);

  const handleReportPress = () => {
    if (onReportPress) {
      onReportPress();
    }
  };

  const handleLogout = async () => {
    try {
      await postRequest('/api/authentication/logout', {});
    } catch {
      // Swallow error if offline
    } finally {
      await deleteToken();
      if (onLogout) {
        onLogout();
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer} testID="loading-indicator">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer} testID="error-container">
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error}
          </Typography>
          <Button label="Reintentar" onPress={fetchUserDataAndIncidents} testID="retry-button" />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ReportButton onPress={handleReportPress} />
        {incidents.length === 0 ? (
          <View style={styles.emptyContainer} testID="empty-container">
            <Typography variant="body" color={designTokens.colors['text-secondary']} style={styles.emptyText}>
              Aún no tienes incidentes reportados.
            </Typography>
          </View>
        ) : (
          <IncidentList
            title="Tus últimos reportes"
            incidents={incidents}
            footerNote="Solo se muestran tus reportes de las últimas 24 h"
          />
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar 
        userName={userName} 
        userLine={userLine} 
        shift={userShift} 
        onMenuPress={() => setMenuVisible(true)} 
      />
      {renderContent()}
      {menuVisible && (
        <ProfileMenu
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
          onClose={() => setMenuVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors['background-primary'],
  },
  content: {
    padding: parseInt(designTokens.spacing['4']),
    gap: parseInt(designTokens.spacing['4']),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});

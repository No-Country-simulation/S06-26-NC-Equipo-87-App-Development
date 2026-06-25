import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TopBar } from '../../../shared/components/organisms/TopBar';
import { ProfileMenu } from '../../../shared/components/molecules/ProfileMenu';
import { ReportButton } from '../../../shared/components/molecules/ReportButton';
import { IncidentList } from '../../../shared/components/organisms/IncidentList';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Button } from '../../../shared/components/atoms/Button';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import designTokens from '../../../shared/theme/designTokens.json';

const mapStatusToLabel = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === 'in-progress') {
    return 'En proceso';
  }
  if (normalized === 'closed') {
    return 'Cerrado';
  }
  if (normalized === 'assigned') {
    return 'Asignado';
  }
  return 'Abierto';
};

const mapStatusToType = (status: string): 'open' | 'in-progress' | 'closed' | 'assigned' => {
  const normalized = status.toLowerCase().replace('_', '-');
  if (normalized === 'in-progress' || normalized === 'inprogress') {
    return 'in-progress';
  }
  if (normalized === 'closed') {
    return 'closed';
  }
  if (normalized === 'assigned') {
    return 'assigned';
  }
  return 'open';
};

interface OperatorDashboardScreenProps {
  onReportPress?: () => void;
  onLogout?: () => void;
  onIncidentPress?: (id: string) => void;
}


export const OperatorDashboardScreen: React.FC<OperatorDashboardScreenProps> = ({ onReportPress, onLogout, onIncidentPress }) => {
  const user = useAuthStore((state) => state.user);
  const fetchOperatorIncidents = useIncidentStore((state) => state.fetchOperatorIncidents);
  const storeIncidents = useIncidentStore((state) => state.incidents);
  const [userName, setUserName] = useState<string>('Usuario');
  const [userRole, setUserRole] = useState<string>('Operador');
  const [userLine, setUserLine] = useState<string>('Sin área');
  const [userShift, setUserShift] = useState<string>('Sin turno');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const fetchUserDataAndIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error('No valid authentication session found.');
      }

      const userId = user.sub || '';
      const rawFirstName = user.firstName || '';
      const rawLastName = user.lastName || '';
      if (rawFirstName) {
        const lastNameInitial = rawLastName ? ` ${rawLastName.charAt(0)}.` : '';
        setUserName(`${rawFirstName}${lastNameInitial}`);
      }
      if (user.areaName) {
        if (Array.isArray(user.areaName)) {
          setUserLine(user.areaName.join(', '));
        } else {
          setUserLine(user.areaName as string);
        }
      }
      if (user.shiftName) {
        setUserShift(user.shiftName as string);
      }

      const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const roleValue = (user[roleClaim] as string) || user.role;
      if (roleValue) {
        setUserRole(roleValue);
      }

      const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await fetchOperatorIncidents(userId, sinceDate);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchOperatorIncidents]);

  const incidents = React.useMemo(() => {
    return storeIncidents.map((item) => ({
      id: item.incidentId,
      title: item.incidentTypeName || item.description || 'Incidente',
      status: mapStatusToType(item.status),
      statusLabel: mapStatusToLabel(item.status),
    }));
  }, [storeIncidents]);

  useEffect(() => {
    fetchUserDataAndIncidents();
  }, [fetchUserDataAndIncidents]);

  const handleReportPress = () => {
    if (onReportPress) {
      onReportPress();
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
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
            onIncidentPress={onIncidentPress}
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

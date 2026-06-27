import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Button } from '../../../shared/components/atoms/Button';
import { SupervisorTicketList } from '../../../shared/components/organisms/SupervisorTicketList';
import { OfflineBanner } from '../../../shared/components/molecules/OfflineBanner';
import { TabView, TabRoute } from '../../../shared/components/molecules/TabView';
import designTokens from '../../../shared/theme/designTokens.json';

import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import { ProfileMenu } from '../../../shared/components/molecules/ProfileMenu';

interface SupervisorDashboardScreenProps {
  onTicketPress?: (ticketId: string) => void;
  onMenuPress?: () => void;
  onLogout?: () => void;
}

export const SupervisorDashboardScreen: React.FC<SupervisorDashboardScreenProps> = ({
  onTicketPress,
  onMenuPress,
  onLogout,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline] = useState(false);
  const user = useAuthStore((state) => state.user);
  const fetchSupervisorIncidents = useIncidentStore((state) => state.fetchSupervisorIncidents);
  const incidents = useIncidentStore((state) => state.incidents);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Claudia M.');
  const [userRole, setUserRole] = useState<string>('Supervisor');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const formatElapsed = (reportedDateStr: string): string => {
    const reportedDate = new Date(reportedDateStr);
    const diffMs = Date.now() - reportedDate.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} d`;
  };

  const mapSeverity = (severityName: string): 'Alta' | 'Media' | 'Baja' => {
    const normalized = severityName.toLowerCase();
    if (normalized === 'alto' || normalized === 'alta') return 'Alta';
    if (normalized === 'medio' || normalized === 'media') return 'Media';
    return 'Baja';
  };

  const mapStatusToType = (status: string): 'open' | 'in-progress' | 'closed' | 'assigned' => {
    const normalized = status.toLowerCase().replace('_', '-');
    if (normalized === 'assigned') {
      return 'assigned';
    }
    if (normalized === 'in-progress' || normalized === 'inprogress') {
      return 'in-progress';
    }
    if (normalized === 'closed') {
      return 'closed';
    }
    return 'open';
  };

  const mapStatusToLabel = (status: string): string => {
    const normalized = status.toLowerCase();
    if (normalized === 'in-progress') {
      return 'En proceso';
    }
    if (normalized === 'assigned') {
      return 'Asignado';
    }
    if (normalized === 'closed') {
      return 'Cerrado';
    }
    return 'Abierto';
  };

  const fetchIncidents = useCallback(async () => {
    try {
      if (user) {
        const rawFirstName = user.firstName || '';
        const rawLastName = user.lastName || '';
        if (rawFirstName) {
          const lastNameInitial = rawLastName ? ` ${rawLastName.charAt(0)}.` : '';
          setUserName(`${rawFirstName}${lastNameInitial}`);
        }
        const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const roleValue = (user[roleClaim] as string) || user.role;
        if (roleValue) {
          setUserRole(roleValue);
        }
      }

      await fetchSupervisorIncidents();
      setError(null);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, fetchSupervisorIncidents]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents();
  }, [fetchIncidents]);

  const handleLogout = async () => {
    setMenuVisible(false);
    if (onLogout) {
      onLogout();
    }
  };

  const tickets = React.useMemo(() => {
    return incidents.map((item) => ({
      id: item.incidentId,
      incidentCode: item.incidentId,
      areaName: item.areaName,
      elapsedTime: formatElapsed(item.reportedDate),
      categoryName: item.incidentTypeName || 'Incidente',
      description: item.description,
      operatorNumber: item.reportedByEmployeeId ? '#' + item.reportedByEmployeeId : 'N/A',
      severity: mapSeverity(item.severityTypeName),
      status: mapStatusToType(item.status),
      statusLabel: mapStatusToLabel(item.status),
      pendingSync: false,
    }));
  }, [incidents]);

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const assignedCount = tickets.filter((t) => t.status === 'assigned').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in-progress').length;
  const closedCount = tickets.filter((t) => t.status === 'closed').length;

  const routes: TabRoute[] = [
    { key: 'todos', title: 'Todos', badgeCount: totalCount === 0 ? 0 : undefined },
    { key: 'abiertos', title: 'Abiertos', badgeCount: openCount > 0 ? openCount : undefined, badgeBgColor: designTokens.colors['status-open'] },
    { key: 'asignados', title: 'Asignados', badgeCount: assignedCount > 0 ? assignedCount : undefined, badgeBgColor: designTokens.colors['status-assigned'] },
    { key: 'en-proceso', title: 'En proceso', badgeCount: inProgressCount > 0 ? inProgressCount : undefined, badgeBgColor: designTokens.colors['status-in-progress'] },
    { key: 'cerrados', title: 'Cerrados', badgeCount: closedCount > 0 ? closedCount : undefined, badgeBgColor: designTokens.colors['status-closed'] },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const activeFilter = routes[tabIndex].key;
    switch (activeFilter) {
      case 'abiertos':
        return ticket.status === 'open';
      case 'asignados':
        return ticket.status === 'assigned';
      case 'en-proceso':
        return ticket.status === 'in-progress';
      case 'cerrados':
        return ticket.status === 'closed';
      default:
        return true;
    }
  });

  const renderScene = () => (
    <SupervisorTicketList
      tickets={filteredTickets}
      onTicketPress={onTicketPress}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error}
          </Typography>
          <Button label="Reintentar" onPress={fetchIncidents} />
        </View>
      );
    }

    return (
      <TabView
        navigationState={{ index: tabIndex, routes }}
        onIndexChange={setTabIndex}
        renderScene={renderScene}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <View style={styles.headerSide} />
          <Typography variant="label" color="#FFFFFF" style={styles.headerTitle}>
            Tickets activos
          </Typography>
          <TouchableOpacity
            style={styles.headerSideRight}
            activeOpacity={0.7}
            onPress={() => {
              setMenuVisible(true);
              onMenuPress?.();
            }}
          >
            <Typography variant="caption" color="#A3A199" style={styles.headerUser}>
              {userName}
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isOffline && <OfflineBanner />}

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
  header: {
    backgroundColor: designTokens.colors['background-dark'],
  },
  headerContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerSide: {
    width: 80,
  },
  headerSideRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerUser: {
    fontSize: 13,
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
});


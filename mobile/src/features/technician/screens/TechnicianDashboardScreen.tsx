import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../shared/components/atoms/Typography';
import { TechnicianTicketCard, TechnicianTicket } from '../../../shared/components/molecules/TechnicianTicketCard';
import { ClipboardIcon } from '../../../shared/components/atoms/Icons/ClipboardIcon';
import designTokens from '../../../shared/theme/designTokens.json';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import { Button } from '../../../shared/components/atoms/Button';
import { ProfileMenu } from '../../../shared/components/molecules/ProfileMenu';

interface TechnicianDashboardScreenProps {
  onTicketPress?: (ticketId: string) => void;
  onLogout?: () => void;
}



export const TechnicianDashboardScreen: React.FC<TechnicianDashboardScreenProps> = ({
  onTicketPress,
  onLogout,
}) => {
  const user = useAuthStore((state) => state.user);
  const fetchSupervisorIncidents = useIncidentStore((state) => state.fetchSupervisorIncidents);
  const startAttentionStore = useIncidentStore((state) => state.startAttention);
  const storeIncidents = useIncidentStore((state) => state.incidents);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Técnico');
  const [userRole, setUserRole] = useState<string>('Técnico');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [startedTicketIds, setStartedTicketIds] = useState<string[]>([]);

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

  const mapSeverity = (severityName: string): string => {
    const normalized = severityName.toLowerCase();
    if (normalized === 'alto' || normalized === 'alta') return 'Alto';
    if (normalized === 'medio' || normalized === 'media') return 'Medio';
    return 'Bajo';
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
  }, [user, startedTicketIds, fetchSupervisorIncidents]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const tickets = React.useMemo(() => {
    return storeIncidents.map((item) => ({
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
      serviceStarted: item.status.toLowerCase() === 'in-progress' || startedTicketIds.includes(item.incidentId),
    }));
  }, [storeIncidents, startedTicketIds]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents();
  }, [fetchIncidents]);

  const handleLogout = useCallback(async () => {
    setMenuVisible(false);
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  const handleStartAttention = useCallback(async (ticketId: string) => {
    setStartedTicketIds((prev) => [...prev, ticketId]);

    try {
      await startAttentionStore(ticketId);
      await fetchIncidents();
    } catch (err: unknown) {
      console.warn('Failed to start incident attention on backend:', err);
      await fetchIncidents();
    }
  }, [fetchIncidents, startAttentionStore]);

  const renderTicketItem = useCallback(
    ({ item }: { item: TechnicianTicket }) => (
      <View style={styles.cardWrapper}>
        <TechnicianTicketCard
          ticket={item}
          onStartAttention={() => handleStartAttention(item.id)}
          onViewDetail={() => onTicketPress?.(item.id)}
        />
      </View>
    ),
    [handleStartAttention, onTicketPress]
  );

  const keyExtractor = useCallback((item: TechnicianTicket) => item.id, []);

  const renderHeader = () => (
    <Typography
      variant="micro"
      color={designTokens.colors['text-tertiary']}
      style={styles.sectionHeader}
    >
      Asignados a mí
    </Typography>
  );

  const renderFooter = () => (
    <View style={styles.dashedFooter}>
      <ClipboardIcon color="#C8C6BC" style={styles.footerIcon} />
      <Typography
        variant="caption"
        color={designTokens.colors['text-secondary']}
        style={styles.footerText}
      >
        No hay más tickets asignados
      </Typography>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.dashedFooter}>
      <ClipboardIcon color="#C8C6BC" style={styles.footerIcon} />
      <Typography
        variant="caption"
        color={designTokens.colors['text-secondary']}
        style={styles.footerText}
      >
        No hay tickets asignados
      </Typography>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer} testID="dashboard-loading">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer} testID="dashboard-error">
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error}
          </Typography>
          <Button label="Reintentar" onPress={() => { setLoading(true); fetchIncidents(); }} testID="dashboard-retry" />
        </View>
      );
    }

    return (
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={tickets.length > 0 ? renderFooter : undefined}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Dark brand TopBar Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <View style={styles.headerSide} />
          <Typography variant="label" color="#FFFFFF" style={styles.headerTitle}>
            Mis tickets
          </Typography>
          <TouchableOpacity
            style={styles.headerSideRight}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Typography variant="caption" color="#A3A199" style={styles.headerUser}>
              {userName}
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tickets List or Loading/Error State */}
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
    width: 120,
  },
  headerSideRight: {
    width: 120,
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
  listContent: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.8,
    fontSize: 11,
    fontWeight: '600',
  },
  cardWrapper: {
    marginBottom: parseInt(designTokens.spacing['3']),
  },
  dashedFooter: {
    height: 100,
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderStyle: 'dashed',
    borderRadius: parseInt(designTokens.rounded.md),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
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

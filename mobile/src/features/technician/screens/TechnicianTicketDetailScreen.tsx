import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Card } from '../../../shared/components/atoms/Card';
import { Button } from '../../../shared/components/atoms/Button';
import { StatusBadge } from '../../../shared/components/atoms/StatusBadge';
import { SeverityBadge, SeverityType } from '../../../shared/components/atoms/SeverityBadge';
import { MapPinIcon } from '../../../shared/components/atoms/Icons/MapPinIcon';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import designTokens from '../../../shared/theme/designTokens.json';

interface TechnicianTicketDetailScreenProps {
  ticketId: string;
  onBack?: () => void;
  onResolve?: () => void;
}

export interface DetailedTechnicianTicket {
  id: string;
  incidentCode: string;
  areaName: string;
  elapsedTime: string;
  categoryName: string;
  description?: string;
  descriptionDetail: string;
  operatorNumber: string;
  severity: string;
  status: 'open' | 'in-progress' | 'closed' | 'assigned';
  statusLabel: string;
  serviceStarted: boolean;
  elapsedTimeDetail: string;
}

export const TechnicianTicketDetailScreen: React.FC<TechnicianTicketDetailScreenProps> = ({
  ticketId,
  onBack,
  onResolve,
}) => {
  const fetchIncidentDetailStore = useIncidentStore((state) => state.fetchIncidentDetail);
  const [ticket, setTicket] = useState<DetailedTechnicianTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatElapsed = (reportedDateStr: string): string => {
    const reportedDate = new Date(reportedDateStr);
    const diffMs = Date.now() - reportedDate.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    
    if (diffMins < 60) {
      return `hace ${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `hace ${diffHours} h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays} d`;
  };

  const formatElapsedMins = (reportedDateStr: string): string => {
    const reportedDate = new Date(reportedDateStr);
    const diffMs = Date.now() - reportedDate.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    
    const hh = String(Math.floor(diffMins / 60)).padStart(2, '0');
    const mm = String(diffMins % 60).padStart(2, '0');
    return `${hh}:${mm}`;
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

  const fetchIncidentDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidentDetailStore(ticketId);
      setTicket({
        id: data.incidentId,
        incidentCode: data.incidentId,
        areaName: data.areaName,
        elapsedTime: formatElapsed(data.reportedDate),
        categoryName: data.incidentTypeName || 'Incidente',
        description: data.description,
        descriptionDetail: data.description || 'Sin descripción',
        operatorNumber: data.reportedByUserId ? '#' + data.reportedByUserId.substring(0, 5) : 'N/A',
        severity: mapSeverity(data.severityTypeName),
        status: mapStatusToType(data.status),
        statusLabel: mapStatusToLabel(data.status),
        serviceStarted: data.status.toLowerCase() === 'in-progress',
        elapsedTimeDetail: formatElapsedMins(data.reportedDate),
      });
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al obtener los detalles del incidente.');
    } finally {
      setLoading(false);
    }
  }, [ticketId, fetchIncidentDetailStore]);

  useEffect(() => {
    fetchIncidentDetail();
  }, [fetchIncidentDetail]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader title={ticketId} showBack={true} onBack={onBack} />
        <View style={styles.loadingContainer} testID="detail-loading">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader title={ticketId} showBack={true} onBack={onBack} />
        <View style={styles.errorContainer} testID="detail-error">
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error || 'No se pudieron cargar los detalles del ticket.'}
          </Typography>
          <Button label="Reintentar" onPress={fetchIncidentDetail} testID="detail-retry" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Dark Header with back button */}
      <NavigationHeader
        title={ticket.incidentCode}
        onBack={onBack}
        showBack={true}
        showClose={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dark Location Card */}
        <Card style={styles.locationCard}>
          <View style={styles.pinCircle}>
            <MapPinIcon color="#FFFFFF" />
          </View>
          <View style={styles.locationTextContainer}>
            <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.metaLabel}>
              UBICACIÓN
            </Typography>
            <Typography variant="body" color="#FFFFFF" style={styles.locationName}>
              {ticket.areaName}
            </Typography>
          </View>
        </Card>

        {/* Incident Main Info Card */}
        <Card style={styles.infoCard}>
          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <StatusBadge status={ticket.status} label={ticket.statusLabel} />
            <SeverityBadge severity={ticket.severity as SeverityType} />
          </View>

          {/* Category */}
          <Typography
            variant="heading"
            color={designTokens.colors['text-primary']}
            style={styles.categoryName}
          >
            {ticket.categoryName}
          </Typography>

          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.gridRow}>
            <Typography variant="caption" color={designTokens.colors['text-secondary']}>
              Reportado por
            </Typography>
            <Typography variant="caption" color={designTokens.colors['text-primary']} style={styles.gridValue}>
              Operador {ticket.operatorNumber}
            </Typography>
          </View>

          <View style={[styles.gridRow, { marginTop: 12 }]}>
            <Typography variant="caption" color={designTokens.colors['text-secondary']}>
              Hace
            </Typography>
            <Typography variant="mono" color={designTokens.colors['text-primary']} style={styles.gridValueMono}>
              {ticket.elapsedTimeDetail}
            </Typography>
          </View>
        </Card>

        {/* Description Card */}
        <Card style={styles.descriptionCard}>
          <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.metaLabel}>
            Descripción del incidente
          </Typography>
          <Typography variant="body" color={designTokens.colors['text-primary']} style={styles.descriptionText}>
            {ticket.descriptionDetail}
          </Typography>
        </Card>
      </ScrollView>

      {/* Footer Action Button */}
      <View style={styles.footer}>
        {ticket.status === 'closed' ? (
          <Button label="Volver al Inicio" onPress={onBack} />
        ) : (
          <Button label="Resolver incidente →" onPress={onResolve} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors['background-primary'],
  },
  scrollContent: {
    padding: parseInt(designTokens.spacing['4']),
    paddingBottom: 24,
  },
  locationCard: {
    backgroundColor: designTokens.colors['background-dark'],
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: designTokens.colors['surface-dark-card'],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationTextContainer: {
    justifyContent: 'center',
  },
  metaLabel: {
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0DDD4',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridValue: {
    fontWeight: '500',
  },
  gridValueMono: {
    fontSize: 14,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  descriptionText: {
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: designTokens.colors['background-primary'],
    borderTopWidth: 1,
    borderTopColor: '#E0DDD4',
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

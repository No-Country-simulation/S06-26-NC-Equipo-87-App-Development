import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../shared/components/atoms/Button';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { StepIndicator } from '../../../shared/components/atoms/StepIndicator';
import { IncidentConfirmationHero } from '../../../shared/components/organisms/IncidentConfirmationHero';
import { IncidentSummaryCard } from '../../../shared/components/organisms/IncidentSummaryCard';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import designTokens from '../../../shared/theme/designTokens.json';

interface OperatorTicketDetailScreenProps {
  incidentId: string;
  onBack?: () => void;
  onClose?: () => void;
}

interface BackendIncidentDetail {
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

interface MappedIncident {
  id: string;
  area: string;
  type: string;
  severity: string;
  severityColor: string;
  time: string;
}

const formatTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return dateStr;
  }
};

const resolveSeverityColor = (label: string): string => {
  const l = label.toLowerCase();
  if (l === 'alto' || l === 'high' || l === 'crítico' || l === 'critical') {
    return designTokens.colors['status-open'];
  }
  if (l === 'medio' || l === 'medium') {
    return designTokens.colors['status-in-progress'];
  }
  return designTokens.colors['text-primary'];
};

const mapBackendToIncident = (data: BackendIncidentDetail): MappedIncident => ({
  id: data.incidentId,
  area: data.areaName,
  type: data.incidentTypeName || data.description || 'Incidente',
  severity: data.severityTypeName,
  severityColor: resolveSeverityColor(data.severityTypeName),
  time: formatTime(data.reportedDate),
});

export const OperatorTicketDetailScreen: React.FC<OperatorTicketDetailScreenProps> = ({
  incidentId,
  onBack,
  onClose,
}) => {
  const fetchIncidentDetailStore = useIncidentStore((state) => state.fetchIncidentDetail);
  const selectedIncident = useIncidentStore((state) => state.selectedIncident);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const incident = React.useMemo(() => {
    if (!selectedIncident || selectedIncident.incidentId !== incidentId) return null;
    return mapBackendToIncident(selectedIncident);
  }, [selectedIncident, incidentId]);

  const fetchIncidentDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchIncidentDetailStore(incidentId);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al obtener los detalles del incidente.');
    } finally {
      setLoading(false);
    }
  }, [incidentId, fetchIncidentDetailStore]);

  useEffect(() => {
    fetchIncidentDetail();
  }, [fetchIncidentDetail]);

  const handleGoHome = () => {
    if (onClose) onClose();
    else if (onBack) onBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <NavigationHeader title="Reporte enviado" showBack={false} onClose={handleGoHome} />
        <View style={styles.stepRow}>
          <StepIndicator currentStep={3} totalSteps={3} />
        </View>
        <View style={styles.loadingContainer} testID="detail-loading">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <NavigationHeader title="Reporte enviado" showBack={false} onClose={handleGoHome} />
        <View style={styles.stepRow}>
          <StepIndicator currentStep={3} totalSteps={3} />
        </View>
        <View style={styles.errorContainer} testID="detail-error">
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error}
          </Typography>
          <Button label="Reintentar" onPress={fetchIncidentDetail} testID="detail-retry" />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader title="Reporte enviado" showBack={false} onClose={handleGoHome} />
      
      <View style={styles.stepRow}>
        <StepIndicator currentStep={3} totalSteps={3} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <IncidentConfirmationHero incidentId={incident?.id ?? incidentId} />
        {incident && (
          <IncidentSummaryCard
            area={incident.area}
            type={incident.type}
            severity={incident.severity}
            severityColor={incident.severityColor}
            time={incident.time}
          />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Volver al inicio" onPress={handleGoHome} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors['background-primary'],
  },
  stepRow: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designTokens.colors['background-primary'],
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: designTokens.colors['background-primary'],
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

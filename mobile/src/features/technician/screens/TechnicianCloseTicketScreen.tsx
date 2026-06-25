import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Card } from '../../../shared/components/atoms/Card';
import { TextArea } from '../../../shared/components/molecules/TextArea';
import { DropdownSelector } from '../../../shared/components/molecules/DropdownSelector';
import designTokens from '../../../shared/theme/designTokens.json';
import { useLookupStore } from '../../incidents/stores/useLookupStore';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import { ApiError } from '../../../shared/api/apiClient';
import { Button } from '../../../shared/components/atoms/Button';

interface TechnicianCloseTicketScreenProps {
  ticketId: string;
  onBack?: () => void;
  onCloseTicket?: (ticketId: string, solutionText: string, rootCause: string) => void;
}

interface CloseTicketDetails {
  id: string;
  incidentCode: string;
  categoryName: string;
  areaName: string;
  reportedDate: string;
}


export const TechnicianCloseTicketScreen: React.FC<TechnicianCloseTicketScreenProps> = ({
  ticketId,
  onBack,
  onCloseTicket,
}) => {
  const fetchIncidentDetailStore = useIncidentStore((state) => state.fetchIncidentDetail);
  const closeIncidentStore = useIncidentStore((state) => state.closeIncident);
  
  const rootCauses = useLookupStore((state) => state.rootCauses);
  const fetchRootCauses = useLookupStore((state) => state.fetchRootCauses);

  const [ticket, setTicket] = useState<CloseTicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [solutionText, setSolutionText] = useState('');
  const [selectedRootCause, setSelectedRootCause] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatElapsedMins = (reportedDateStr: string): string => {
    if (!reportedDateStr) return '';
    const reportedDate = new Date(reportedDateStr);
    const diffMs = Date.now() - reportedDate.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    
    if (diffMins < 60) {
      return `Abierto hace ${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Abierto hace ${diffHours} h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `Abierto hace ${diffDays} d`;
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketData] = await Promise.all([
        fetchIncidentDetailStore(ticketId),
        fetchRootCauses(),
      ]);

      setTicket({
        id: ticketData.incidentId,
        incidentCode: ticketData.incidentId,
        categoryName: ticketData.incidentTypeName || 'Incidente',
        areaName: ticketData.areaName,
        reportedDate: ticketData.reportedDate,
      });
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al obtener los detalles del incidente.');
    } finally {
      setLoading(false);
    }
  }, [ticketId, fetchIncidentDetailStore, fetchRootCauses]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (rootCauses.length > 0 && !selectedRootCause) {
      setSelectedRootCause(rootCauses[0].name);
    }
  }, [rootCauses, selectedRootCause]);

  const handleClosePress = useCallback(async () => {
    const text = solutionText.trim();
    if (!text) {
      setValidationError('La solución aplicada es obligatoria.');
      return;
    }

    const matchedCause = rootCauses.find((rc) => rc.name === selectedRootCause);
    if (!matchedCause) {
      setValidationError('Debe seleccionar una causa raíz válida.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    setSubmitError(null);

    try {
      await closeIncidentStore(ticketId, text, matchedCause.id);

      onCloseTicket?.(ticketId, text, selectedRootCause);
    } catch (err: unknown) {
      setSubmitError((err as ApiError)?.message || 'Error al cerrar el ticket.');
    } finally {
      setSubmitting(false);
    }
  }, [ticketId, solutionText, selectedRootCause, rootCauses, onCloseTicket, closeIncidentStore]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader title={`Cerrar ${ticketId}`} showBack={true} onBack={onBack} />
        <View style={styles.loadingContainer} testID="close-loading">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader title={`Cerrar ${ticketId}`} showBack={true} onBack={onBack} />
        <View style={styles.errorContainer} testID="close-error">
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error || 'No se pudieron cargar los detalles del ticket.'}
          </Typography>
          <Button label="Reintentar" onPress={fetchInitialData} testID="close-retry" />
        </View>
      </SafeAreaView>
    );
  }

  const rootCauseOptions = rootCauses.map((rc) => rc.name);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Dark navbar header */}
      <NavigationHeader
        title={`Cerrar ${ticket.incidentCode}`}
        onBack={onBack}
        onClose={onBack}
        showBack={true}
        showClose={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Incident Summary Card */}
        <Card style={styles.summaryCard}>
          <Typography
            variant="heading"
            color={designTokens.colors['text-primary']}
            style={styles.categoryName}
          >
            {ticket.categoryName}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-secondary']}>
            {ticket.areaName} · {formatElapsedMins(ticket.reportedDate)}
          </Typography>
        </Card>

        {/* Input Section 1: Solution */}
        <TextArea
          label="Solución aplicada"
          required
          value={solutionText}
          onChangeText={(val) => {
            setSolutionText(val);
            if (val.trim()) setValidationError(null);
          }}
          errorMessage={validationError || undefined}
          maxCharacters={200}
          placeholder="Describa la solución realizada..."
        />

        {/* Input Section 2: Root Cause */}
        {rootCauseOptions.length > 0 && (
          <View style={styles.selectorWrapper}>
            <DropdownSelector
              label="Causa raíz"
              required
              options={rootCauseOptions}
              selectedValue={selectedRootCause}
              onSelect={setSelectedRootCause}
            />
          </View>
        )}

        {/* Requirement Hint */}
        <Typography variant="caption" color={designTokens.colors['text-tertiary']} style={styles.hintText}>
          * Ambos campos son obligatorios para cerrar
        </Typography>

        {submitError && (
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.submitErrorText}>
            {submitError}
          </Typography>
        )}
      </ScrollView>

      {/* Footer Close Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClosePress}
          disabled={submitting}
          style={[styles.closeButton, submitting && { opacity: 0.7 }]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Typography variant="label" color="#FFFFFF" style={styles.closeButtonText}>
              Cerrar ticket ✓
            </Typography>
          )}
        </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 4,
  },
  selectorWrapper: {
    marginTop: 20,
  },
  hintText: {
    marginTop: 16,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitErrorText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: designTokens.colors['background-primary'],
    borderTopWidth: 1,
    borderTopColor: '#E0DDD4',
  },
  closeButton: {
    height: 56,
    borderRadius: 10,
    backgroundColor: designTokens.colors['status-closed'],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 15,
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

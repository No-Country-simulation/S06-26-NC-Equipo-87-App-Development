import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Chip } from '../../../shared/components/atoms/Chip';
import { StepIndicator } from '../../../shared/components/atoms/StepIndicator';
import { Button } from '../../../shared/components/atoms/Button';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { IncidentTypeCard } from '../../../shared/components/molecules/IncidentTypeCard';
import { SeverityButton } from '../../../shared/components/molecules/SeverityButton';
import { WrenchIcon } from '../../../shared/components/atoms/Icons/WrenchIcon';
import { WarningIcon } from '../../../shared/components/atoms/Icons/WarningIcon';
import { QualityIcon } from '../../../shared/components/atoms/Icons/QualityIcon';
import { PlusIcon } from '../../../shared/components/atoms/Icons/PlusIcon';
import { useLookupStore } from '../../incidents/stores/useLookupStore';
import designTokens from '../../../shared/theme/designTokens.json';

interface OperatorNewIncidentStep1ScreenProps {
  onBack: () => void;
  onClose: () => void;
  onNext: (areaId: number, incidentTypeId: number, severityTypeId: number) => void;
}

const resolveIncidentTypeIcon = (name: string): React.ReactElement => {
  const n = name.toLowerCase();
  if (n.includes('mecánica') || n.includes('mechanical')) return <WrenchIcon />;
  if (n.includes('accidente') || n.includes('accident')) return <WarningIcon />;
  if (n.includes('calidad') || n.includes('quality')) return <QualityIcon />;
  return <PlusIcon />;
};

export const OperatorNewIncidentStep1Screen: React.FC<OperatorNewIncidentStep1ScreenProps> = ({
  onBack,
  onClose,
  onNext,
}) => {
  const { areas, types, severities, fetchActiveLookups } = useLookupStore();

  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedSeverityId, setSelectedSeverityId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLookups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchActiveLookups();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al cargar los datos de configuración.');
    } finally {
      setLoading(false);
    }
  }, [fetchActiveLookups]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    if (areas.length > 0 && selectedAreaId === null) {
      setSelectedAreaId(areas[0].id);
    }
    if (types.length > 0 && selectedTypeId === null) {
      setSelectedTypeId(types[0].id);
    }
    if (severities.length > 0 && selectedSeverityId === null) {
      setSelectedSeverityId(severities[0].id);
    }
  }, [areas, types, severities, selectedAreaId, selectedTypeId, selectedSeverityId]);

  const canProceed =
    selectedAreaId !== null && selectedTypeId !== null && selectedSeverityId !== null;

  const handleNextPress = () => {
    if (canProceed) {
      onNext(selectedAreaId!, selectedTypeId!, selectedSeverityId!);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <NavigationHeader title="Nuevo incidente" onBack={onBack} onClose={onClose} />
        <View style={styles.stepRow}>
          <StepIndicator currentStep={1} totalSteps={3} />
        </View>
        <View style={styles.loadingContainer} testID="step1-loading">
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <NavigationHeader title="Nuevo incidente" onBack={onBack} onClose={onClose} />
        <View style={styles.stepRow}>
          <StepIndicator currentStep={1} totalSteps={3} />
        </View>
        <View style={styles.errorContainer} testID="step1-error">
          <Typography
            variant="body"
            color={designTokens.colors['status-open']}
            style={styles.errorText}
          >
            {error}
          </Typography>
          <Button label="Reintentar" onPress={fetchLookups} testID="step1-retry-button" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationHeader title="Nuevo incidente" onBack={onBack} onClose={onClose} />

      <View style={styles.stepRow}>
        <StepIndicator currentStep={1} totalSteps={3} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionLabel}>
            Área de la planta
          </Typography>
          <View style={styles.chipGroup}>
            {areas.map((area) => (
              <Chip
                key={area.id}
                label={area.name}
                selected={selectedAreaId === area.id}
                onPress={() => setSelectedAreaId(area.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionLabel}>
            Tipo de incidente
          </Typography>
          <View style={styles.grid}>
            {types.map((type, index) => (
              <View
                key={type.id}
                style={[
                  styles.gridCell,
                  index % 2 === 0 ? styles.gridCellLeft : styles.gridCellRight,
                ]}
              >
                <IncidentTypeCard
                  label={type.name}
                  icon={resolveIncidentTypeIcon(type.name)}
                  selected={selectedTypeId === type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionLabel}>
            Severidad
          </Typography>
          <View style={styles.severityGroup}>
            {severities.map((level) => (
              <SeverityButton
                key={level.id}
                level={level.name}
                selected={selectedSeverityId === level.id}
                onPress={() => setSelectedSeverityId(level.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <Button label="Siguiente →" onPress={handleNextPress} disabled={!canProceed} />
      </SafeAreaView>
    </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridCell: {
    width: '50%',
    paddingVertical: 4,
  },
  gridCellLeft: {
    paddingRight: 4,
    paddingLeft: 0,
  },
  gridCellRight: {
    paddingLeft: 4,
    paddingRight: 0,
  },
  severityGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
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

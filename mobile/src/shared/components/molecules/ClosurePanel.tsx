import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { Chip } from '../atoms/Chip';
import { Button } from '../atoms/Button';
import designTokens from '../../theme/designTokens.json';

const ROOT_CAUSES = ['Desgaste', 'Falta de lubricación', 'Error de operación', 'Falla eléctrica'];
const RESOLUTIONS = ['Ajuste mecánico', 'Cambio de pieza', 'Limpieza', 'Reinicio de sistema'];

interface ClosurePanelProps {
  onSubmit: (data: { rootCause: string; resolution: string }) => void;
  onCancel: () => void;
}

export const ClosurePanel: React.FC<ClosurePanelProps> = ({ onSubmit, onCancel }) => {
  const [selectedRootCause, setSelectedRootCause] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedRootCause && selectedResolution) {
      onSubmit({ rootCause: selectedRootCause, resolution: selectedResolution });
    }
  };

  const isComplete = !!selectedRootCause && !!selectedResolution;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionLabel}>
          CAUSA RAÍZ
        </Typography>
        <View style={styles.chipGroup}>
          {ROOT_CAUSES.map((cause) => (
            <Chip
              key={cause}
              label={cause}
              selected={selectedRootCause === cause}
              onPress={() => setSelectedRootCause(cause)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionLabel}>
          RESOLUCIÓN
        </Typography>
        <View style={styles.chipGroup}>
          {RESOLUTIONS.map((res) => (
            <Chip
              key={res}
              label={res}
              selected={selectedResolution === res}
              onPress={() => setSelectedResolution(res)}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button 
          label="Confirmar cierre" 
          onPress={handleSubmit} 
          disabled={!isComplete} 
        />
        <Button 
          label="Cancelar" 
          onPress={onCancel} 
          variant="secondary" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});

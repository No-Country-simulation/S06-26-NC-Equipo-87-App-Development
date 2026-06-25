import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '../../../shared/components/atoms/StepIndicator';
import { Button } from '../../../shared/components/atoms/Button';
import { TextArea } from '../../../shared/components/molecules/TextArea';
import { OfflineBanner } from '../../../shared/components/molecules/OfflineBanner';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import designTokens from '../../../shared/theme/designTokens.json';

interface OperatorNewIncidentStep2ScreenProps {
  onBack: () => void;
  onClose: () => void;
  onSubmit: (description: string) => void;
  isOffline?: boolean;
}

export const OperatorNewIncidentStep2Screen: React.FC<OperatorNewIncidentStep2ScreenProps> = ({
  onBack,
  onClose,
  onSubmit,
  isOffline = false,
}) => {
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isEmpty = description.trim().length === 0;
  const isTooShort = !isEmpty && description.trim().length < 20;
  const isTooLong = description.trim().length > 500;
  const showError = submitted && (isEmpty || isTooShort || isTooLong);

  const getErrorMessage = () => {
    if (!showError) return undefined;
    if (isEmpty) return 'La descripción es obligatoria para reportar.';
    if (isTooShort) return 'Ingresa al menos 20 caracteres.';
    if (isTooLong) return 'La descripción no puede superar los 500 caracteres.';
    return undefined;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isEmpty && !isTooShort && !isTooLong) {
      onSubmit(description);
    }
  };

  return (
    <View style={styles.container}>
      <NavigationHeader title="Descripción" onBack={onBack} onClose={onClose} />

      <View style={styles.stepRow}>
        <StepIndicator currentStep={2} totalSteps={3} />
      </View>

      {isOffline && <OfflineBanner />}

      <View style={styles.body}>
        <TextArea
          label="¿Qué pasó?"
          placeholder="Describe brevemente qué sucedió y dónde"
          helperText="Describe brevemente qué sucedió y dónde"
          value={description}
          onChangeText={setDescription}
          errorMessage={getErrorMessage()}
          fillHeight
        />
      </View>

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <Button
          label="Enviar reporte →"
          onPress={handleSubmit}
          disabled={showError}
        />
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
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: designTokens.colors['background-primary'],
  },
});

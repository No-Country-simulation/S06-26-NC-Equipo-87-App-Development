import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Typography } from '../atoms/Typography';
import { ValidationMessage } from '../atoms/ValidationMessage';
import designTokens from '../../theme/designTokens.json';

interface TextAreaProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorMessage?: string;
  maxCharacters?: number;
  value: string;
  fillHeight?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  helperText,
  errorMessage,
  maxCharacters = 500,
  value,
  fillHeight = false,
  ...props
}) => {
  const hasError = !!errorMessage;
  const labelColor = hasError
    ? designTokens.colors['status-open']
    : designTokens.colors['text-tertiary'];
  const charCountColor = hasError
    ? designTokens.colors['status-open']
    : designTokens.colors['text-tertiary'];

  return (
    <View style={[styles.container, fillHeight && styles.containerFill]}>
      <Typography variant="micro" color={labelColor} style={styles.label}>
        {label}
      </Typography>

      <View
        style={[
          styles.inputContainer,
          fillHeight && styles.inputContainerFill,
          hasError && styles.inputContainerError,
        ]}
      >
        <TextInput
          multiline
          style={[styles.input, fillHeight && styles.inputFill]}
          placeholderTextColor={designTokens.colors['text-muted']}
          maxLength={maxCharacters}
          value={value}
          textAlignVertical="top"
          {...props}
        />
        {hasError && (
          <Typography variant="micro" color={charCountColor} style={styles.charCountAbsolute}>
            {value.length} / {maxCharacters}
          </Typography>
        )}
      </View>

      {hasError ? (
        <ValidationMessage message={errorMessage!} />
      ) : (
        <View style={styles.footer}>
          {helperText ? (
            <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.helperText}>
              {helperText}
            </Typography>
          ) : (
            <View />
          )}
          <Typography variant="micro" color={charCountColor} style={styles.charCountBelow}>
            {value.length} / {maxCharacters}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerFill: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: designTokens.colors['surface-card'],
    borderColor: '#D3D1C7',
    borderWidth: 1.25,
    borderRadius: 8,
    minHeight: 120,
    padding: 12,
  },
  inputContainerFill: {
    flex: 1,
  },
  inputContainerError: {
    borderColor: designTokens.colors['status-open'],
    borderWidth: 1.5,
  },
  input: {
    fontFamily: designTokens.typography.body.fontFamily,
    fontSize: 14,
    color: designTokens.colors['text-primary'],
    lineHeight: 21,
    flex: 1,
  },
  inputFill: {
    flex: 1,
  },
  charCountAbsolute: {
    textAlign: 'right',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  helperText: {
    flex: 1,
  },
  charCountBelow: {
    marginLeft: 8,
  },
});

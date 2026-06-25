import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface DropdownSelectorProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  required?: boolean;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  required = false,
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label with optional red asterisk */}
      <Typography
        variant="micro"
        color={designTokens.colors['text-tertiary']}
        style={styles.label}
      >
        {label}
        {required && (
          <Typography variant="micro" color={designTokens.colors['status-open']}>
            {' *'}
          </Typography>
        )}
      </Typography>

      {/* Dropdown Selector Box */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsPickerVisible(true)}
        style={styles.pickerBox}
      >
        <Typography variant="body" color={designTokens.colors['text-primary']}>
          {selectedValue}
        </Typography>
        <Typography variant="body" color={designTokens.colors['text-tertiary']}>
          ▼
        </Typography>
      </TouchableOpacity>

      {/* Picker Modal Overlay */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayDismiss}
            activeOpacity={1}
            onPress={() => setIsPickerVisible(false)}
          />
          <View style={styles.modalContent}>
            <Typography variant="heading" color={designTokens.colors['text-primary']} style={styles.modalTitle}>
              Seleccionar {label}
            </Typography>
            <View style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = selectedValue === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(option);
                      setIsPickerVisible(false);
                    }}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                  >
                    <Typography
                      variant="body"
                      color={isSelected ? designTokens.colors['text-primary'] : designTokens.colors['text-secondary']}
                      style={isSelected ? styles.optionTextSelected : undefined}
                    >
                      {option}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  pickerBox: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderColor: '#D3D1C7',
    borderWidth: 1.25,
    borderRadius: parseInt(designTokens.rounded.md),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalOverlayDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: parseInt(designTokens.rounded.lg),
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    borderTopWidth: 1,
    borderTopColor: '#E0DDD4',
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDD4',
  },
  optionItemSelected: {
    backgroundColor: '#F5F3EC',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});

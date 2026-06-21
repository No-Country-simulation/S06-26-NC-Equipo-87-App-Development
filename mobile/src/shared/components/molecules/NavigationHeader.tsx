import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../atoms/Typography';
import { BackIcon } from '../atoms/Icons/BackIcon';
import { CloseIcon } from '../atoms/Icons/CloseIcon';
import designTokens from '../../theme/designTokens.json';
import { HEADER_HEIGHT } from '../../theme/layoutConstants';

interface NavigationHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  showBack?: boolean;
  showClose?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  onBack,
  onClose,
  showBack = true,
  showClose = true,
}) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.navBar}>
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.button}>
            <BackIcon color={designTokens.colors['text-on-dark']} />
          </TouchableOpacity>
        )}
      </View>

      <Typography variant="label" color={designTokens.colors['text-on-dark']} style={styles.title}>
        {title}
      </Typography>

      <View style={styles.side}>
        {showClose && (
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.button}>
            <CloseIcon color="#9A9890" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors['background-dark'],
  },
  navBar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  side: {
    width: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: HEADER_HEIGHT,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

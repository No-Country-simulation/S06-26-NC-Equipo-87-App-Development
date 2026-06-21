import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../atoms/Typography';
import { GearIcon } from '../atoms/Icons/GearIcon';
import designTokens from '../../theme/designTokens.json';
import { HEADER_HEIGHT } from '../../theme/layoutConstants';

interface TopBarProps {
  userName: string;
  userLine: string;
  shift?: string;
  onMenuPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ userName, userLine, shift, onMenuPress }) => (
  <View>
    <View style={styles.navBar}>
      <SafeAreaView>
        <View style={styles.navContent}>
          <View style={styles.brand}>
            <GearIcon color={designTokens.colors['text-on-dark']} />
            <Typography variant="label" color={designTokens.colors['text-on-dark']} style={styles.brandText}>
              OpsCore
            </Typography>
          </View>
          <TouchableOpacity 
            onPress={onMenuPress} 
            activeOpacity={0.7}
            style={styles.menuTrigger}
          >
            <Typography variant="caption" color={designTokens.colors['text-on-dark']} style={styles.userName}> 
              {userName}
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>

    <View style={styles.subBar}>
      <Typography variant="micro" color={designTokens.colors['text-secondary']} style={styles.subBarText}>
        {shift ? `${shift.toUpperCase()} · ` : ''}{userLine.toUpperCase()}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: designTokens.colors['background-dark'],
    width: '100%',
  },
  navContent: {
    height: HEADER_HEIGHT,
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  userName: {
    color: designTokens.colors['text-on-dark'],
    opacity: 0.85,
  },
  menuTrigger: {
    paddingVertical: 10,
    paddingLeft: 20,
  },
  subBar: {
    backgroundColor: designTokens.colors['background-primary'],
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0ddd4',
  },
  subBarText: {
    letterSpacing: 0.8,
  },
});

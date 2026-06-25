import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserIcon } from '../atoms/Icons/UserIcon';
import { Typography } from '../atoms/Typography';
import designTokens from '../../theme/designTokens.json';

interface UserInfoProps {
  name: string;
  line: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ name, line }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <UserIcon color={designTokens.colors['text-on-dark']} />
      </View>
      <View style={styles.details}>
        <Typography variant="label" color={designTokens.colors['text-on-dark']}>
          Hola, {name}
        </Typography>
        <Typography variant="caption" color={designTokens.colors['text-tertiary']}>
          {line}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: designTokens.colors['surface-dark-card'],
    width: 32,
    height: 32,
    borderRadius: parseInt(designTokens.rounded.lg),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  details: {
    justifyContent: 'center',
  },
});

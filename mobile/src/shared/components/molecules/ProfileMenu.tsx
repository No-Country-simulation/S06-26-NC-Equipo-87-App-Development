import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../atoms/Typography';
import { LogoutIcon } from '../atoms/Icons/LogoutIcon';
import designTokens from '../../theme/designTokens.json';

interface ProfileMenuProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
  onClose: () => void;
}

const mapRoleToSpanish = (role: string): string => {
  if (!role) {
    return '';
  }
  const normalizedRole = role.toLowerCase().trim();
  if (normalizedRole === 'technician') {
    return 'Técnico';
  }
  if (normalizedRole === 'operator') {
    return 'Operador';
  }
  if (normalizedRole === 'plant manager' || normalizedRole === 'plantmanager') {
    return 'Gerente de Planta';
  }
  if (normalizedRole === 'supervisor') {
    return 'Supervisor';
  }
  return role;
};

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  userName,
  userRole,
  onLogout,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Typography variant="label" color={designTokens.colors['text-primary']} style={styles.userName}>
            {userName}
          </Typography>
          <Typography variant="caption" color={designTokens.colors['text-secondary']} style={styles.roleText}> 
            {mapRoleToSpanish(userRole)}
          </Typography>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutItem} onPress={onLogout} activeOpacity={0.7}>
          <LogoutIcon color={designTokens.colors['status-open']} />
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.logoutText}>     
            Cerrar sesión
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    top: 60, // Adjust based on TopBar height
    right: parseInt(designTokens.spacing['4']),
    width: 200,
    backgroundColor: designTokens.colors['surface-card'],
    borderRadius: parseInt(designTokens.rounded.md),
    paddingVertical: parseInt(designTokens.spacing['2']),
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 5,
    borderWidth: 1,
    borderColor: designTokens.colors['background-primary'],
  },
  userInfo: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingVertical: parseInt(designTokens.spacing['3']),
  },
  userName: {
    fontWeight: '600',
  },
  roleText: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: designTokens.colors['background-primary'],
    marginHorizontal: parseInt(designTokens.spacing['4']),
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingVertical: parseInt(designTokens.spacing['3']),
    gap: 8,
  },
  logoutText: {
    fontWeight: '500',
  },
});

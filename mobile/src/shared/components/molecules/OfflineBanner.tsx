import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';
import { WifiOffIcon } from '../atoms/Icons/WifiOffIcon';

export const OfflineBanner = () => {
  return (
    <View style={styles.container}>
      <WifiOffIcon color="#633806" />
      <Typography variant="caption" color="#633806" style={styles.text}>
        Sin conexión — se enviará al recuperar señal
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: '#FAEEDA',
    borderBottomWidth: 1.25,
    borderBottomColor: '#EF9F27',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  text: {
    fontSize: 12,
  },
});

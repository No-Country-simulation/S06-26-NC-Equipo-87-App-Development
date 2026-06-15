import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Ops Core - Mobile Client (SDK 54.0.35)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

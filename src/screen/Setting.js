import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Setting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Text style={styles.description}>
        This is where you can manage your application settings.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
  },
});

export default Setting;

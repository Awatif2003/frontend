import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context';

const InitialScreen = ({ navigation }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // When authentication state is determined, navigate accordingly
    if (!loading) {
      navigation.reset({
        index: 0,
        routes: [{ name: isAuthenticated ? 'Dashboard' : 'Login' }],
      });
    }
  }, [isAuthenticated, loading, navigation]);

  // Show loading spinner while checking authentication
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InitialScreen;

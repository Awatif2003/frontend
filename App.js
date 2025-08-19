import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './src/context';
import AppNavigator from './src/navigation/Appnavigator';
import ApiService from './src/services/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simplified initialization - just set the default API URL and continue
    async function initializeApp() {
      try {
        // Simple initialization without extensive diagnostics
        await ApiService.initialize();
      } catch (error) {
        console.log('API initialization error:', error);
      } finally {
        // Always continue to the app after a short delay
        setTimeout(() => setIsLoading(false), 1000);
      }
    }

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Starting SafeSea...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default App;

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
// Try importing with a specific file extension
import { useAuth } from '../context';
import ApiService from '../services/api';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Handle login button press
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Login Error', 'Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting login process...');
      const responseData = await ApiService.login(username, password);
      console.log('✅ Login API response:', { 
        success: responseData.success, 
        hasToken: !!responseData.token,
        username: responseData.username 
      });

      if (responseData.success) {
        // Pass the complete user data and token to AuthContext
        const userData = {
          username: responseData.username || username,
          // Add any other user fields from the response
          ...responseData.user
        };
        
        await login(userData, responseData.token);
        console.log('✅ User login completed, navigating to Dashboard');
        
        // Navigate to the 'Dashboard' screen within the 'Home' (DrawerNavigator)
        navigation.navigate('Home', { screen: 'Dashboard' });
      } else {
        console.error('❌ Login failed: Backend returned success: false');
        Alert.alert('Login Error', 'Invalid username or password.');
      }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      // Check for specific error messages to differentiate network errors
      if (error.message === 'Request timeout' || error.message.includes('Network request failed')) {
        Alert.alert('Login Error', 'Network error. Please try again later.');
      } else {
        Alert.alert('Login Error', 'Invalid username or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Text style={styles.title}>🚤 Marine Safety System</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#94A3B8"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#3B82F6',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    borderColor: '#334155',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Login;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native'; // Import CommonActions
import { useAuth } from '../context';

const MyProfile = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Reset the navigation stack to the Login screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.description}>
          This is your profile page. You can view and manage your personal information here.
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#DC2626', // Red color for logout
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default MyProfile;

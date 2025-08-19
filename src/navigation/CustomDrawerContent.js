import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'; // Import DrawerItem
import { useNavigation } from '@react-navigation/native';

function CustomDrawerContent(props) {
  const navigation = useNavigation();

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Menu</Text>
      </View>

      <DrawerItem
        label="Dashboard"
        onPress={() => navigation.navigate('Home', { screen: 'Dashboard' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
      <DrawerItem
        label="Weather"
        onPress={() => navigation.navigate('Home', { screen: 'Weather' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
      <DrawerItem
        label="Alerts"
        onPress={() => navigation.navigate('Home', { screen: 'Alerts' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
      <DrawerItem
        label="Location"
        onPress={() => navigation.navigate('Home', { screen: 'Location' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
      <DrawerItem
        label="Settings"
        onPress={() => navigation.navigate('Home', { screen: 'Settings' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
      <DrawerItem
        label="My Profile"
        onPress={() => navigation.navigate('Home', { screen: 'MyProfile' })}
        labelStyle={styles.drawerItemText}
        style={styles.drawerItem}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B', // Dark background
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#1E293B', // Dark background for header
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0', // Light text color
  },
  drawerItem: {
    padding: 0, // Remove default padding from DrawerItem
    marginHorizontal: 0, // Remove default horizontal margin
    marginVertical: 0, // Remove default vertical margin
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // Darker border for separation
  },
  drawerItemText: {
    fontSize: 16,
    color: '#3B82F6', // Light blue for links
    paddingVertical: 15, // Add padding to text for touchable area
    paddingHorizontal: 20, // Add padding to text for alignment
  },
});

export default CustomDrawerContent;

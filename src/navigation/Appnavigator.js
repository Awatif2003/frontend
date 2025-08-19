import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context';
import Alerts from '../screen/Alerts';
import Dashboard from '../screen/Dashboard';
import Location from '../screen/Location';
import MarineLogin from '../screen/Login';
import Weather from '../screen/Weather';
import Settings from '../screen/Setting';
import MyProfile from '../screen/MyProfile';
import CustomDrawerContent from './CustomDrawerContent';
import CustomHeader from '../components/CustomHeader'; // Import the new CustomHeader

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#3182ce',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerShown: true, // Show header for all drawer screens
        header: ({ navigation, route, options }) => (
          <CustomHeader title={options.title || route.name} />
        ),
        drawerStyle: {
          backgroundColor: '#1E293B', // Dark background for the drawer itself
          width: '60%', // Reduced drawer width
        },
        drawerLabelStyle: {
          color: '#3B82F6', // Light blue for drawer item labels
        },
      })}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Weather" component={Weather} options={{ title: 'Weather' }} />
      <Drawer.Screen name="Alerts" component={Alerts} options={{ title: 'Alerts' }} />
      <Drawer.Screen name="Location" component={Location} options={{ title: 'Location' }} />
      <Drawer.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
      <Drawer.Screen name="MyProfile" component={MyProfile} options={{ title: 'My Profile' }} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'} // Dynamically set initial route
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="Login"
        component={MarineLogin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;

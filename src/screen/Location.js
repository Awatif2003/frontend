import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ApiService from '../services/api';

const Location = () => {
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLocationData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load local location data
      const localData = await ApiService.getLocationData();
      
      if (localData && localData.length > 0) {
        setLocationData(localData[0]); // Assuming the first item is the relevant one
      }
    } catch (e) {
      setError('Failed to load location data.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocationData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Data</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading location data...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {/* Local Location Data */}
          {locationData ? (
            <View style={styles.dataContainer}>
              <Text style={styles.sectionTitle}>🏠 Local GPS Data</Text>
              <Text style={styles.dataText}>Latitude: {locationData.Latitude}</Text>
              <Text style={styles.dataText}>Longitude: {locationData.Longitude}</Text>
              <Text style={styles.dataText}>Timestamp: {new Date(locationData.Timestamp).toLocaleString()}</Text>
              <Text style={styles.dataText}>Boat ID: {locationData.BoatID}</Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No local location data available.</Text>
          )}
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={loadLocationData}>
        <Text style={styles.buttonText}>🔄 Refresh Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Consistent dark background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6', // Light blue for titles
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#94A3B8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 15,
    textAlign: 'center',
  },
  dataContainer: {
    backgroundColor: '#1E293B', // Darker background for cards
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    marginBottom: 20,
  },
  dataText: {
    fontSize: 16,
    color: '#E2E8F0', // Light text color
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626', // Red for errors
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#CBD5E1', // Light text color
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3B82F6', // Light blue for buttons
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Location;

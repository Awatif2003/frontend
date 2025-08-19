import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import ApiService from '../services/api';

// Conditional Firebase import
let database = null;
let ref = null;
let onValue = null;
let off = null;

try {
  const firebaseModule = require('../config/firebase');
  const firebaseDatabase = require('firebase/database');
  
  database = firebaseModule.database;
  ref = firebaseDatabase.ref;
  onValue = firebaseDatabase.onValue;
  off = firebaseDatabase.off;
} catch (error) {
  console.log('📱 Firebase not configured, using local data only');
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [firebaseData, setFirebaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to load weather data from local API
  const loadWeatherData = async () => {
    try {
      console.log('🌦️ Fetching local weather data...');
      const data = await ApiService.getWeatherData();
      
      if (data && data.length > 0) {
        const latestData = data[0];
        setWeatherData(latestData);
        console.log('✅ Local weather data loaded:', latestData);
      } else {
        console.log('⚠️ No local weather data received');
      }
    } catch (err) {
      console.error('❌ Error loading local weather data:', err);
    }
  };

  // Function to load Firebase data
  const loadFirebaseData = () => {
    if (!database || !ref || !onValue) {
      console.log('📱 Firebase not available, skipping Firebase data');
      return null;
    }

    try {
      console.log('🔥 Setting up Firebase listener...');
      
      const weatherRef = ref(database, 'weather/current');
      
      const unsubscribe = onValue(weatherRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFirebaseData(data);
          console.log('✅ Firebase weather data loaded:', data);
        } else {
          console.log('⚠️ No Firebase weather data found');
          setFirebaseData(null);
        }
      }, (error) => {
        console.error('❌ Firebase error:', error);
        setFirebaseData(null);
      });

      return unsubscribe;
    } catch (err) {
      console.error('❌ Error setting up Firebase listener:', err);
      return null;
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await loadWeatherData();
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Error loading weather data:', err);
      setError('Unable to load weather data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    const unsubscribeFirebase = loadFirebaseData();
    const interval = setInterval(loadWeatherData, 30000);
    
    return () => {
      if (unsubscribeFirebase && database && off) {
        try {
          const weatherRef = ref(database, 'weather/current');
          off(weatherRef);
        } catch (error) {
          console.log('Error cleaning up Firebase listener:', error);
        }
      }
      clearInterval(interval);
    };
  }, []);

  const formatWindSpeed = (speedMs) => {
    if (speedMs == null) return 'N/A';
    const speedKmh = (speedMs * 3.6).toFixed(1);
    return `${speedKmh} km/h`;
  };

  const formatTemperature = (temp) => {
    if (temp == null) return 'N/A';
    return `${temp.toFixed(1)}°C`;
  };

  const formatHumidity = (humidity) => {
    if (humidity == null) return 'N/A';
    return `${humidity.toFixed(1)}%`;
  };

  const getTemperature = () => {
    if (firebaseData?.temperature != null) return formatTemperature(firebaseData.temperature);
    if (weatherData?.Temperature != null) return formatTemperature(weatherData.Temperature);
    if (weatherData?.temperature != null) return formatTemperature(weatherData.temperature);
    return 'N/A';
  };

  const getHumidity = () => {
    if (firebaseData?.humidity != null) return formatHumidity(firebaseData.humidity);
    if (weatherData?.Humidity != null) return formatHumidity(weatherData.Humidity);
    if (weatherData?.humidity != null) return formatHumidity(weatherData.humidity);
    return 'N/A';
  };

  const getWindSpeed = () => {
    if (firebaseData?.windSpeed != null) return formatWindSpeed(firebaseData.windSpeed);
    if (weatherData?.WindSpeed != null) return formatWindSpeed(weatherData.WindSpeed);
    if (weatherData?.windSpeed != null) return formatWindSpeed(weatherData.windSpeed);
    return 'N/A';
  };

  const WeatherCard = ({ icon, title, value, color }) => (
    <View style={[styles.weatherCard, { borderColor: color }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAllData}>
            <Text style={styles.retryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>🌊 Weather Conditions</Text>
        <Text style={styles.subtitle}>Current marine weather data</Text>
      </View>

      <View style={styles.weatherGrid}>
        <WeatherCard
          icon="🌡️"
          title="Temperature"
          value={getTemperature()}
          color="#FF6B6B"
        />
        
        <WeatherCard
          icon="💧"
          title="Humidity"
          value={getHumidity()}
          color="#4ECDC4"
        />
        
        <WeatherCard
          icon="💨"
          title="Wind Speed"
          value={getWindSpeed()}
          color="#45B7D1"
        />
      </View>

      <View style={styles.dataSourceContainer}>
        <Text style={styles.dataSourceTitle}>📡 Data Sources</Text>
        
        {firebaseData && (
          <View style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>🔥</Text>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>Firebase Cloud</Text>
              <Text style={styles.sourceStatus}>✅ Real-time</Text>
            </View>
          </View>
        )}
        
        {weatherData && (
          <View style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>🏠</Text>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>Local Sensors</Text>
              <Text style={styles.sourceStatus}>✅ Active</Text>
            </View>
          </View>
        )}

        {!firebaseData && !weatherData && (
          <View style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>❌</Text>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>No Data Sources</Text>
              <Text style={[styles.sourceStatus, { color: '#EF4444' }]}>Offline</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.updateContainer}>
        <Text style={styles.updateTitle}>🕒 Last Updated</Text>
        <Text style={styles.updateTime}>
          {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Unknown'}
        </Text>
        {weatherData?.Timestamp && (
          <Text style={styles.updateDetail}>
            Local: {new Date(weatherData.Timestamp).toLocaleString()}
          </Text>
        )}
        {weatherData?.timestamp && (
          <Text style={styles.updateDetail}>
            Local: {new Date(weatherData.timestamp).toLocaleString()}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadAllData}>
        <Text style={styles.refreshIcon}>🔄</Text>
        <Text style={styles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  weatherGrid: {
    marginBottom: 30,
  },
  weatherCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataSourceContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  dataSourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sourceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  sourceStatus: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  updateContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  updateTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  updateDetail: {
    fontSize: 12,
    color: '#94A3B8',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Weather;

import { Audio } from 'expo-av'; // Add this import
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import ApiService from '../services/api';

const AlertsScreen = () => {
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);

  // Configure audio settings
  useEffect(() => {
    configureAudio();
    loadAlertsData();
    
    return () => {
      // Clean up sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Configure audio for emergency sounds
  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('🔊 Audio configured for emergency alerts');
    } catch (error) {
      console.error('Error configuring audio:', error);
    }
  };

  // Play emergency sound based on alert severity
  const playEmergencySound = async (alertSeverity) => {
    try {
      // Stop any existing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      let soundUri;
      let vibrationPattern;

      // Choose sound and vibration based on severity
      switch (alertSeverity.toLowerCase()) {
        case 'high':
        case 'emergency':
          // Emergency siren sound (you can replace with local file)
          soundUri = { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' };
          vibrationPattern = [0, 500, 200, 500, 200, 500]; // Long vibrations
          break;
        case 'medium':
        case 'warning':
          // Warning beep sound
          soundUri = { uri: 'https://www.soundjay.com/misc/sounds/beep-07.wav' };
          vibrationPattern = [0, 300, 100, 300]; // Medium vibrations
          break;
        case 'low':
        case 'info':
          // Info notification sound
          soundUri = { uri: 'https://www.soundjay.com/misc/sounds/beep-10.wav' };
          vibrationPattern = [0, 200]; // Short vibration
          break;
        default:
          // Default emergency sound
          soundUri = { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' };
          vibrationPattern = [0, 500, 200, 500];
      }

      console.log('🚨 Playing emergency sound for severity:', alertSeverity);

      // Create and play sound
      const { sound: newSound } = await Audio.Sound.createAsync(soundUri, {
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      });

      setSound(newSound);

      // Add vibration for additional alert
      Vibration.vibrate(vibrationPattern);

      // Auto-stop sound after 5 seconds
      setTimeout(async () => {
        if (newSound) {
          try {
            await newSound.stopAsync();
            console.log('🔇 Emergency sound auto-stopped');
          } catch (error) {
            console.error('Error auto-stopping sound:', error);
          }
        }
      }, 5000);

    } catch (error) {
      console.error('Error playing emergency sound:', error);
      // Fallback: Use system alert and vibration
      playFallbackAlert(alertSeverity);
    }
  };

  // Fallback alert system if audio fails
  const playFallbackAlert = (severity) => {
    // System vibration
    const vibrationPattern = severity.toLowerCase() === 'high' ? 
      [0, 500, 200, 500, 200, 500] : [0, 300, 100, 300];
    
    Vibration.vibrate(vibrationPattern);
    
    // System beep using Alert
    Alert.alert('🚨 Emergency Alert', '', [], { cancelable: true });
  };

  // Stop emergency sound
  const stopEmergencySound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        console.log('🔇 Emergency sound stopped manually');
      }
      Vibration.cancel(); // Stop vibration
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  // Handle alert click with emergency sound
  const handleAlertClick = async (alert) => {
    console.log('🚨 Emergency alert activated:', alert);
    
    // Play emergency sound and vibration
    await playEmergencySound(alert.Severity);
    
    // Show alert details with emergency options
    Alert.alert(
      `🚨 ${alert.AlertType.toUpperCase()} ALERT`,
      `${alert.Message}\n\n⚠️ Severity: ${alert.Severity}\n🕒 Time: ${new Date(alert.Timestamp).toLocaleString()}`,
      [
        {
          text: '🔇 Stop Sound',
          onPress: () => stopEmergencySound(),
          style: 'destructive'
        },
        {
          text: '✅ Acknowledge',
          onPress: () => acknowledgeAlert(alert),
          style: 'default'
        },
        {
          text: '📞 Emergency Call',
          onPress: () => initiateEmergencyCall(),
          style: 'default'
        }
      ],
      { 
        cancelable: false // Force user to acknowledge
      }
    );
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alert) => {
    try {
      await stopEmergencySound();
      console.log('✅ Alert acknowledged:', alert.AlertID);
      
      // You can add logic here to mark alert as acknowledged in backend
      Alert.alert(
        '✅ Alert Acknowledged', 
        `${alert.AlertType} alert has been acknowledged and logged.`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Emergency call function
  const initiateEmergencyCall = () => {
    Alert.alert(
      '📞 Emergency Services',
      'Would you like to contact emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '🚨 Call Coast Guard', 
          onPress: () => {
            // You can implement actual calling here
            console.log('📞 Initiating Coast Guard call...');
            Alert.alert('📞', 'Contacting Coast Guard...', [{ text: 'OK' }]);
          }
        }
      ]
    );
  };

  // Load alerts data
  const loadAlertsData = async () => {
    try {
      setLoading(true);
      console.log('🚨 Loading alerts data...');
      
      // Get alerts data from API service
      const data = await ApiService.getAlertsData();
      
      if (data && data.length > 0) {
        setAlertsData(data);
        console.log('✅ Alerts data loaded successfully:', data.length, 'alerts');
      } else {
        console.log('⚠️ No alerts data received, using fallback');
        // Fallback to local mock data if API fails
        const fallbackAlerts = [
          {
            AlertID: 'fallback_001',
            AlertType: 'System',
            Message: '📡 Alert system is operational. No current emergencies.',
            Timestamp: new Date().toISOString(),
            Severity: 'Low'
          }
        ];
        setAlertsData(fallbackAlerts);
      }
    } catch (error) {
      console.error('❌ Error loading alerts data:', error);
      
      // Emergency fallback data
      const emergencyAlerts = [
        {
          AlertID: 'error_001',
          AlertType: 'System',
          Message: '⚠️ Alert system temporarily unavailable. Using local alerts only.',
          Timestamp: new Date().toISOString(),
          Severity: 'Medium'
        }
      ];
      setAlertsData(emergencyAlerts);
    } finally {
      setLoading(false);
    }
  };

  // Render alert item
  const renderAlert = ({ item }) => {
    const getAlertColor = (severity) => {
      switch (severity.toLowerCase()) {
        case 'high':
        case 'emergency':
          return '#DC2626'; // Red
        case 'medium':
        case 'warning':
          return '#D97706'; // Orange
        case 'low':
        case 'info':
          return '#2563EB'; // Blue
        default:
          return '#6B7280'; // Gray
      }
    };

    const getAlertIcon = (severity) => {
      switch (severity.toLowerCase()) {
        case 'high':
        case 'emergency':
          return '🚨';
        case 'medium':
        case 'warning':
          return '⚠️';
        case 'low':
        case 'info':
          return 'ℹ️';
        default:
          return '📢';
      }
    };

    return (
      <TouchableOpacity 
        style={[
          styles.alertCard,
          { borderLeftColor: getAlertColor(item.Severity) }
        ]}
        onPress={() => handleAlertClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.alertHeader}>
          <Text style={styles.alertType}>
            {getAlertIcon(item.Severity)} {item.AlertType}
          </Text>
          <View style={[
            styles.severityBadge,
            { backgroundColor: getAlertColor(item.Severity) }
          ]}>
            <Text style={styles.severityText}>{item.Severity}</Text>
          </View>
        </View>
        <Text style={styles.alertMessage}>{item.Message}</Text>
        <Text style={styles.alertTimestamp}>
          {new Date(item.Timestamp).toLocaleString()}
        </Text>
        <Text style={styles.emergencyNote}>
          🔊 Tap for emergency sound & options
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Safety Alert System</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading emergency alerts...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={alertsData}
            renderItem={renderAlert}
            keyExtractor={(item) => item.AlertID}
            style={styles.alertsList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Emergency controls */}
          <View style={styles.emergencyControls}>
            <TouchableOpacity 
              style={styles.stopSoundButton}
              onPress={stopEmergencySound}
            >
              <Text style={styles.stopSoundText}>🔇 Stop All Sounds</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadAlertsData}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh Alerts</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertsList: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alertMessage: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  emergencyNote: {
    fontSize: 12,
    color: '#DC2626',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  emergencyControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  stopSoundButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  stopSoundText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#94A3B8',
  },
});

export default AlertsScreen;

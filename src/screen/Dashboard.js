import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      {/* Main Dashboard Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        
        <Text style={styles.title}>           🚤 Marine Safety System</Text>
        
        <Text style={styles.description}>
          The Marine Safety System is an IoT-powered solution focused on improving marine safety and supporting the blue economy.
        </Text>

        <Text style={styles.sectionTitle}>🚀 What We Do</Text>
        <Text style={styles.bullet}>• Monitor unpredictable weather conditions</Text>
        <Text style={styles.bullet}>• Track real-time boat locations</Text>
        <Text style={styles.bullet}>• Send quick emergency alerts during critical situations</Text>

        <Text style={styles.sectionTitle}>🎯 Why It Matters</Text>
        <Text style={styles.bullet}>• Save the lives of fishermen and sea travelers</Text>
        <Text style={styles.bullet}>• Reduce search and rescue time</Text>
        <Text style={styles.bullet}>• Minimize fuel waste and protect marine resources</Text>
        <Text style={styles.bullet}>• Increase confidence and safety at sea</Text>
        <Text style={styles.bullet}>• Support adaptation to the effects of climate change</Text>

        <Text style={styles.sectionTitle}>🌍 Our Impact</Text>
        <Text style={styles.description}>
          By reducing risks at sea, Marine Safety System helps communities stay safe, boosts economic stability in fishing sectors,
          and contributes to a smarter, more resilient blue economy.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mainContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#38BDF8',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  bullet: {
    color: '#E2E8F0',
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 10,
  },
});

export default Dashboard;


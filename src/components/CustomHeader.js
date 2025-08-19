import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title || 'SafeSea'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E293B',
    paddingTop: 50, // Adjust for status bar
  },
  menuButton: {
    marginRight: 15,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
});

export default CustomHeader;

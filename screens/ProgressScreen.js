// ProgressScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.placeholder}>📊 Charts and graphs coming soon!</Text>
        <Text style={styles.subtext}>
          You'll see:{'\n\n'}
          • Weight progression graphs{'\n'}
          • Volume trends{'\n'}
          • Workout frequency heatmaps{'\n'}
          • Personal records{'\n'}
          • Body measurements
        </Text>
      </ScrollView>
    </View>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    currentStreak: 0,
    totalWorkouts: 0,
  });

  useEffect(() => {
    // Listen to workouts in real-time
    const q = query(
      collection(db, 'workouts'),
      orderBy('date', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workoutData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setWorkouts(workoutData);
      calculateStats(workoutData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading workouts:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const calculateStats = (workoutData) => {
    // Total workouts
    const totalWorkouts = workoutData.length;

    // Workouts this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const workoutsThisWeek = workoutData.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate > oneWeekAgo;
    }).length;

    // Calculate streak (simplified - counts consecutive days with workouts)
    let currentStreak = 0;
    const sortedDates = workoutData.map(w => new Date(w.date).toDateString());
    const uniqueDates = [...new Set(sortedDates)];
    
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday.toDateString())) {
      let checkDate = new Date();
      while (uniqueDates.includes(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    setStats({
      workoutsThisWeek,
      currentStreak,
      totalWorkouts,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const calculateDuration = (workout) => {
    // Estimate: 3 minutes per set
    const totalSets = workout.totalSets || 0;
    const minutes = Math.round(totalSets * 3);
    return `~${minutes} min`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Good Morning! 💪</Text>
        <Text style={styles.headerSubtitle}>
          {workouts.length === 0 ? 'Start your fitness journey!' : 'Ready to crush your workout?'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="flame" size={24} color="#FF6B35" />
          <Text style={styles.statNumber}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="calendar" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{stats.workoutsThisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="barbell" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
      </View>

      {/* Quick Start Button */}
      <TouchableOpacity 
        style={styles.quickStartButton}
        onPress={() => navigation.navigate('Log Workout')}
      >
        <Icon name="add-circle" size={28} color="#fff" />
        <Text style={styles.quickStartText}>Start New Workout</Text>
      </TouchableOpacity>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="barbell-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No workouts yet</Text>
            <Text style={styles.emptyStateText}>
              Start your first workout to see it here!
            </Text>
          </View>
        ) : (
          workouts.slice(0, 5).map(workout => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
                <Text style={styles.workoutDuration}>{calculateDuration(workout)}</Text>
              </View>
              <Text style={styles.workoutName}>
                {workout.exercises.map(e => e.name).join(', ').substring(0, 50)}
                {workout.exercises.length > 2 ? '...' : ''}
              </Text>
              <View style={styles.workoutStats}>
                <Text style={styles.workoutExercises}>
                  {workout.exercises.length} exercises
                </Text>
                <Text style={styles.workoutSets}>
                  {workout.totalSets} sets
                </Text>
                {workout.totalVolume && (
                  <Text style={styles.workoutVolume}>
                    {Math.round(workout.totalVolume).toLocaleString()} lbs total
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickStartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 18,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quickStartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  workoutDuration: {
    fontSize: 12,
    color: '#007AFF',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  workoutStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workoutExercises: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  workoutSets: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  workoutVolume: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
});
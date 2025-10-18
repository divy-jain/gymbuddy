import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Sample exercise database
const EXERCISES = [
  { id: 1, name: 'Bench Press', muscles: ['Chest', 'Triceps'] },
  { id: 2, name: 'Squat', muscles: ['Legs', 'Glutes'] },
  { id: 3, name: 'Deadlift', muscles: ['Back', 'Legs'] },
  { id: 4, name: 'Overhead Press', muscles: ['Shoulders', 'Triceps'] },
  { id: 5, name: 'Barbell Row', muscles: ['Back', 'Biceps'] },
  { id: 6, name: 'Pull-ups', muscles: ['Back', 'Biceps'] },
  { id: 7, name: 'Dips', muscles: ['Chest', 'Triceps'] },
  { id: 8, name: 'Leg Press', muscles: ['Legs', 'Glutes'] },
  { id: 9, name: 'Lat Pulldown', muscles: ['Back', 'Biceps'] },
  { id: 10, name: 'Incline Bench Press', muscles: ['Chest', 'Shoulders'] },
  { id: 11, name: 'Romanian Deadlift', muscles: ['Back', 'Hamstrings'] },
  { id: 12, name: 'Bicep Curls', muscles: ['Biceps'] },
  { id: 13, name: 'Tricep Extensions', muscles: ['Triceps'] },
  { id: 14, name: 'Leg Curls', muscles: ['Hamstrings'] },
  { id: 15, name: 'Leg Extensions', muscles: ['Quads'] },
  { id: 16, name: 'Calf Raises', muscles: ['Calves'] },
  { id: 17, name: 'Face Pulls', muscles: ['Shoulders', 'Back'] },
  { id: 18, name: 'Lateral Raises', muscles: ['Shoulders'] },
  { id: 19, name: 'Cable Rows', muscles: ['Back', 'Biceps'] },
  { id: 20, name: 'Hammer Curls', muscles: ['Biceps'] },
];

export default function WorkoutLogScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [currentSets, setCurrentSets] = useState({});
  const [saving, setSaving] = useState(false);

  const addExercise = (exercise) => {
    setSelectedExercises([...selectedExercises, { 
      ...exercise, 
      sets: [] 
    }]);
    setModalVisible(false);
  };

  const addSet = (exerciseId) => {
    const weight = currentSets[`${exerciseId}_weight`] || '';
    const reps = currentSets[`${exerciseId}_reps`] || '';
    
    if (!weight || !reps) {
      Alert.alert('Missing Info', 'Please enter both weight and reps');
      return;
    }

    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, { weight: parseFloat(weight), reps: parseInt(reps) }]
        };
      }
      return ex;
    }));

    // Clear inputs
    setCurrentSets({
      ...currentSets,
      [`${exerciseId}_weight`]: '',
      [`${exerciseId}_reps`]: ''
    });
  };

  const removeSet = (exerciseId, setIndex) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((_, i) => i !== setIndex)
        };
      }
      return ex;
    }));
  };

  const saveWorkout = async () => {
    if (selectedExercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise');
      return;
    }

    setSaving(true);

    try {
      // Calculate total volume
      const totalVolume = selectedExercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      }, 0);

      // Prepare workout data
      const workoutData = {
        date: new Date().toISOString(),
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex.id,
          name: ex.name,
          muscles: ex.muscles,
          sets: ex.sets
        })),
        totalSets: selectedExercises.reduce((sum, ex) => sum + ex.sets.length, 0),
        totalVolume: totalVolume,
        createdAt: new Date(),
      };

      // Save to Firebase
      await addDoc(collection(db, 'workouts'), workoutData);

      Alert.alert('Success!', '💪 Workout saved successfully!');
      
      // Clear the form
      setSelectedExercises([]);
      setCurrentSets({});
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Workout</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })}</Text>
      </View>

      <ScrollView style={styles.content}>
        {selectedExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.muscleTags}>{exercise.muscles.join(', ')}</Text>
              </View>
            </View>

            {/* Sets Display */}
            {exercise.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setNumber}>Set {index + 1}</Text>
                <Text style={styles.setText}>{set.weight} lbs × {set.reps} reps</Text>
                <TouchableOpacity onPress={() => removeSet(exercise.id, index)}>
                  <Icon name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Input */}
            <View style={styles.addSetContainer}>
              <TextInput
                style={styles.input}
                placeholder="Weight (lbs)"
                keyboardType="numeric"
                value={currentSets[`${exercise.id}_weight`] || ''}
                onChangeText={(text) => setCurrentSets({
                  ...currentSets,
                  [`${exercise.id}_weight`]: text
                })}
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                keyboardType="numeric"
                value={currentSets[`${exercise.id}_reps`] || ''}
                onChangeText={(text) => setCurrentSets({
                  ...currentSets,
                  [`${exercise.id}_reps`]: text
                })}
              />
              <TouchableOpacity 
                style={styles.addSetButton}
                onPress={() => addSet(exercise.id)}
              >
                <Icon name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.addExerciseButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {selectedExercises.length > 0 && (
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveWorkout}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Exercise Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {EXERCISES.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseOption}
                  onPress={() => addExercise(exercise)}
                >
                  <View>
                    <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                    <Text style={styles.exerciseOptionMuscles}>{exercise.muscles.join(', ')}</Text>
                  </View>
                  <Icon name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
  },
  muscleTags: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 50,
  },
  setText: {
    fontSize: 14,
    flex: 1,
  },
  addSetContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  addSetButton: {
    padding: 10,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#34C759',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseOptionMuscles: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
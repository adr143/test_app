import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; // ✅ added
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function ReportFormScreen() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [imageUri, setImageUri] = useState('');
  const [location, setLocation] = useState('');
  const [gpsLocation, setGpsLocation] = useState(''); // ✅ new field
  const [uploading, setUploading] = useState(false);

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // ✅ new: get GPS + reverse geocode
  const getGpsLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;

    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

    const formattedAddress = address
      ? `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`
      : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    setGpsLocation(formattedAddress.trim());
    setLocation(formattedAddress.trim());
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    if (!gpsLocation) {
      Alert.alert('Error', 'Please get your GPS location first.');
      return;
    }

    setUploading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert('Error', 'You must be logged in to submit a report.');
        setUploading(false);
        return;
      }

      const { error } = await supabase.from('reports').insert([
        {
          user_id: userId,
          type: category,
          description,
          location,
          gps_location: gpsLocation,
          image: imageUri,
        },
      ]);

      if (error) {
        Alert.alert('Error', `Failed to submit report: ${error.message}`);
      } else {
        Alert.alert('Success', 'Report submitted successfully!');
        setDescription('');
        setCategory('general');
        setImageUri('');
        setLocation('');
        setGpsLocation('');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>Report Form</Text>

        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="General" value="general" />
          <Picker.Item label="Maintenance" value="maintenance" />
          <Picker.Item label="Incident" value="incident" />
          <Picker.Item label="Accident" value="accident" />
        </Picker>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location (optional)"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity style={styles.imageButton} onPress={getGpsLocation}>
          <Text style={styles.imageButtonText}>Get GPS Location</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Describe what you see..."
          value={description}
          onChangeText={setDescription}
        />

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : null}

        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
          <Text style={styles.imageButtonText}>
            {imageUri ? 'Retake Photo' : 'Take Photo'}
          </Text>
        </TouchableOpacity>

        <Button
          title={uploading ? 'Submitting...' : 'Submit Report'}
          onPress={handleSubmit}
          disabled={uploading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageButtonText: { color: '#007AFF', fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
});

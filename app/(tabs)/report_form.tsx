import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ReportFormScreen() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [imageUri, setImageUri] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- Step 1: Open Camera ---
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

  // --- Step 2: Upload to Supabase Storage ---
  const uploadImageToSupabase = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique filename using timestamp
      const ext = uri.split('.').pop();
      const filename = `report_${Date.now()}.${ext || 'jpg'}`;

      const { data, error } = await supabase.storage
        .from('reports') // bucket name
        .upload(filename, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(filename);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err.message);
      throw err;
    }
  };

  // --- Step 3: Submit Report ---
  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }
    setUploading(true);

    try {
      let uploadedUrl = null;
      if (imageUri) {
        uploadedUrl = await uploadImageToSupabase(imageUri);
      }

      const { data, error } = await supabase.from('reports').insert([
        {
          type: category,
          description,
          location,
          image: uploadedUrl, // link image to report
          // responded defaults to false
        },
      ]);

      if (error) {
        console.error('Insert Error:', error);
        Alert.alert('Error', `Failed to submit report: ${error.message}`);
      } else {
        Alert.alert('Success', 'Report submitted successfully!');
        // Reset form
        setDescription('');
        setCategory('general');
        setImageUri('');
        setLocation('');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
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

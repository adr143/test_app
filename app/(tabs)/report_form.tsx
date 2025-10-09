import { Picker } from '@react-native-picker/picker'; // dropdown picker
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReportFormScreen() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [image, setImage] = useState('');

  const handleSelectImage = () => {
    // placeholder for image selection
    alert('Select image placeholder');
    setImage('https://picsum.photos/200/300');
  };

  const handleSubmit = () => {
    alert(`Submitted:\nCategory: ${category}\nDescription: ${description}\nImage: ${image}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Form Screen</Text>

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={category}
        style={styles.picker}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="General" value="general" />
        <Picker.Item label="Maintenance" value="maintenance" />
        <Picker.Item label="Incident" value="incident" />
      </Picker>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.imageButtonText}>
          {image ? `Selected: ${image}` : 'Select Image'}
        </Text>
      </TouchableOpacity>

      <Button title="Submit Report" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  imageButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageButtonText: { color: '#007AFF', fontWeight: '500' },
});

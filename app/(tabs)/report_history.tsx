import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function ReportHistoryScreen() {
  // Placeholder data for teaching purposes
  const [reports] = useState([
    {
      id: 1,
      category: 'General',
      description: 'Lights are flickering in hallway',
      image: 'https://picsum.photos/200/300', // placeholder image
      responded: true,
    },
    {
      id: 2,
      category: 'Maintenance',
      description: 'Broken window in classroom',
      image: null,
      responded: false,
    },
    {
      id: 3,
      category: 'Incident',
      description: 'Water leak in restroom',
      image: 'https://picsum.photos/200/300',
      responded: false,
    },
  ]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      )}
      <Text
        style={[
          styles.status,
          { color: item.responded ? 'green' : 'red' },
        ]}
      >
        {item.responded ? 'Responded' : 'Not Responded'}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  category: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 8 },
  image: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  status: { fontWeight: '600' },
});

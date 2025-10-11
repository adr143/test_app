import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function ReportHistoryScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();

    const subscription = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    setReports(data || []);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.category}>{item.type || 'General'}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <Text
        style={[
          styles.status,
          { color: item.responded ? 'green' : 'red' },
        ]}
      >
        {item.responded ? 'Responded' : 'Not Responded'}
      </Text>

      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading reports...</Text>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No reports found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      onRefresh={fetchReports}
      refreshing={loading}
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
    elevation: 2,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  description: { fontSize: 14, marginBottom: 8 },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  status: { fontWeight: '600', marginBottom: 4 },
  date: { fontSize: 12, color: '#666' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

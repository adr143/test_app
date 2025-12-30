import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ReportHistoryScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeUserAndFetch();

    // 🔄 Subscribe to realtime report changes
    const reportsChannel = supabase
      .channel('user_reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          const { eventType, new: newItem, old: oldItem } = payload;

          setReports((prev) => {
            let updated = [...prev];
            switch (eventType) {
              case 'INSERT':
                if (newItem.user_id === userId) updated = [newItem, ...prev];
                break;
              case 'UPDATE':
                if (newItem.user_id === userId)
                  updated = prev.map((r) => (r.id === newItem.id ? newItem : r));
                break;
              case 'DELETE':
                if (oldItem.user_id === userId)
                  updated = prev.filter((r) => r.id !== oldItem.id);
                break;
            }
            updated.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
    };
  }, [userId]);

  // 🧠 Initialize user based on stored phone number
  const initializeUserAndFetch = async () => {
    setLoading(true);
    try {
      const userPhone = await AsyncStorage.getItem('userPhone');
      if (!userPhone) {
        console.warn('No stored user phone found.');
        setLoading(false);
        return;
      }

      // 🔍 Fetch user profile by phone number
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone', userPhone)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError?.message);
        setLoading(false);
        return;
      }

      setUserId(userData.id);
      await fetchUserReports(userData.id);
    } catch (err) {
      console.error('Error initializing user:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📥 Fetch reports only for this user
  const fetchUserReports = async (uid: string) => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error.message);
      return;
    }
    setReports(data || []);
  };

  // 🌀 Manual refresh
  const onRefresh = async () => {
    if (userId) {
      setRefreshing(true);
      await fetchUserReports(userId);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        router.push({ pathname: '(tabs)/report_detail', params: { id: item.id } })
      }
      style={({ pressed }) => [styles.card, pressed ? { opacity: 0.8 } : null]}
    >
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

      <Text
        style={[
          styles.priority,
          {
            color:
              item.priority === 'major'
                ? 'darkred'
                : item.priority === 'minor'
                ? 'orange'
                : '#444',
          },
        ]}
      >
        Priority: {item.priority || 'minor'}
      </Text>

      <Text style={styles.location}>📍 {item.gps_location || 'Unknown'}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </Pressable>
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
        <Text>No reports found for your account.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
  priority: { fontWeight: '600', marginBottom: 4 },
  location: { fontSize: 13, color: '#444', marginBottom: 4 },
  date: { fontSize: 12, color: '#666' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

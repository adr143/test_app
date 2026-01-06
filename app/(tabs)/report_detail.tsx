import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type Report = {
  id?: string | number;
  type?: string;
  description?: string;
  image?: string;
  responded?: boolean;
  priority?: string;
  gps_location?: string;
  created_at?: string;
};

// Placeholder fetch function for instructions from an API
async function fetchInstructions(reportType?: string, description?: string): Promise<string> {
  try {
    const apiKey = "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";
    if (!apiKey) {
      throw new Error('OpenRouter API key not found in environment');
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
          {
            "role": "user",
            "content": `Check if this description is an accident or in danger and if so give me instructions on how to respond to it as a normal person in the scene: ${description}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Instructions for ${reportType || 'report'}:\n- Please stay safe.\n- Await response from authorities.`;
  } catch (err) {
    console.error('Error fetching instructions:', err);
    return `Instructions for ${reportType || 'report'}:\n- Please stay safe.\n- Await response from authorities.`;
  }
}

export default function ReportDetailScreen() {
  const params = useLocalSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [instructions, setInstructions] = useState<string>('');
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Fetch report by id from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadReport = async () => {
      const id = params.id;
      if (!id) return;
      setLoadingReport(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching report:', error.message);
          return;
        }

        if (isMounted) setReport(data as Report);
      } catch (err) {
        console.error('Failed to fetch report by id', err);
      } finally {
        if (isMounted) setLoadingReport(false);
      }
    };

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!report) return;
      setLoadingInstructions(true);
      try {
        const txt = await fetchInstructions(report.type, report.description);
        if (isMounted) setInstructions(txt);
      } catch (err) {
        console.error('Failed to fetch instructions', err);
      } finally {
        if (isMounted) setLoadingInstructions(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [report]);

  if (!report) {
    if (loadingReport) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading report...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text>No report data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.category}>{report.type || 'General'}</Text>
      <Text style={styles.description}>{report.description}</Text>

      {report.image ? (
        <Image source={{ uri: report.image }} style={styles.image} />
      ) : null}

      <Text style={[styles.status, { color: report.responded ? 'green' : 'red' }]}>
        {report.responded ? 'Responded' : 'Not Responded'}
      </Text>

      <Text style={styles.priority}>Priority: {report.priority || 'minor'}</Text>
      <Text style={styles.location}>📍 {report.gps_location || 'Unknown'}</Text>
      <Text style={styles.date}>{report.created_at ? new Date(report.created_at).toLocaleString() : ''}</Text>

      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>Instructions</Text>
        {loadingInstructions ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.instructionsText}>{instructions || 'No instructions available.'}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  category: { fontSize: 18, fontWeight: '700', marginBottom: 6, textTransform: 'capitalize' },
  description: { fontSize: 16, marginBottom: 12 },
  image: { width: '100%', height: 300, borderRadius: 8, marginBottom: 12 },
  status: { fontWeight: '700', marginBottom: 6 },
  priority: { fontWeight: '600', marginBottom: 6 },
  location: { fontSize: 14, color: '#444', marginBottom: 6 },
  date: { fontSize: 13, color: '#666', marginBottom: 12 },
  instructionsBox: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 12 },
  instructionsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  instructionsText: { fontSize: 14, lineHeight: 20, color: '#333' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

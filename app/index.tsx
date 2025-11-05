import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userPhone = await AsyncStorage.getItem('userPhone');
      if (userPhone) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  // Simple login - just store phone number
  const handleLogin = async () => {
    if (!phone.trim()) {
      return Alert.alert('Error', 'Please enter your phone number');
    }

    setLoading(true);

    try {
      // Check if user profile exists, if not create one
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', phone.trim())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is okay
        throw fetchError;
      }

      let userId;

      if (!existingProfile) {
        // Create new user profile
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ phone: phone.trim() }])
          .select()
          .single();

        if (insertError) throw insertError;
        userId = newProfile.id;
      } else {
        userId = existingProfile.id;
      }

      // Store user info locally
      await AsyncStorage.setItem('userPhone', phone.trim());
      await AsyncStorage.setItem('userId', userId);

      setLoggedIn(true);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Error', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Redirect after login
  if (loggedIn) {
    return <Redirect href="/(tabs)/report_form" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Enter your phone number to continue
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number (e.g. 09123456789)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Button
        title={loading ? 'Please wait...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
});

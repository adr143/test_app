import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // optional for signUp
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [signing, setSigning] = useState(false);

  // Handle Signup with Phone + Password (optional)
  const handleSignUp = async () => {
    if (!phone) return Alert.alert('Error', 'Enter your phone number');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      phone: phone.startsWith('+') ? phone : `+${phone}`,
      password: password || 'temporary-password', // required for signup
    });
    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Signup Error', error.message);
    } else {
      Alert.alert('OTP Sent', 'Check your phone for the verification code.');
      setStage('otp');
    }
  };

  // Handle OTP Login (Send OTP)
  const handleLogin = async () => {
    if (!phone) return Alert.alert('Error', 'Enter your phone number');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+${phone}`,
    });
    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Login Error', error.message);
    } else {
      Alert.alert('OTP Sent', 'Please check your phone for the verification code.');
      setStage('otp');
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return Alert.alert('Error', 'Enter a valid 6-digit OTP');
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith('+') ? phone : `+${phone}`,
      token: otp,
      type: 'sms',
    });
    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Verification Error', error.message);
    } else {
      setLoggedIn(true);
    }
  };

  // Redirect after login
  if (loggedIn) {
    return <Redirect href="/(tabs)/report_form" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{signing ? 'Sign Up' : 'Login'}</Text>
      {stage === 'phone' ? (
        <>
          <Text style={styles.subtitle}>
            {signing
              ? 'Register your phone number'
              : 'Enter your phone number to receive an OTP'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Phone number (e.g. +13334445555)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {signing && (
            <TextInput
              style={styles.input}
              placeholder="Password (optional)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          )}

          <Button
            title={loading ? 'Please wait...' : signing ? 'Sign Up' : 'Send OTP'}
            onPress={signing ? handleSignUp : handleLogin}
            disabled={loading}
          />

          <Text style={{ marginTop: 20 }}>
            {signing ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Button
            title={signing ? 'Login' : 'Sign Up'}
            onPress={() => setSigning(!signing)}
          />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title={loading ? 'Verifying...' : 'Verify OTP'}
            onPress={handleVerifyOtp}
            disabled={loading}
          />

          <Button
            title="Resend OTP"
            onPress={handleLogin}
            disabled={loading}
          />
        </>
      )}
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

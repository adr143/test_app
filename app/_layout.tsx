import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  // In a full app, you would check user session here
  const loggedIn = false; // placeholder

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {loggedIn ? (
        <Stack.Screen name="(tabs)/report_form" />
      ) : (
        <Stack.Screen name="index" />
      )}
    </Stack>
  );
}

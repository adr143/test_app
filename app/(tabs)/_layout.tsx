import { Tabs } from 'expo-router';
import React from 'react';
import { Button } from 'react-native';

export default function TabsLayout() {
  const handleLogout = () => {
    // placeholder for logout
    console.log('Logout pressed');
  };

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <Button title="Logout" onPress={handleLogout} />,
      }}
    >
      <Tabs.Screen name="report_form" options={{ title: 'Report Form' }} />
      <Tabs.Screen name="report_history" options={{ title: 'Report History' }} />
    </Tabs>
  );
}

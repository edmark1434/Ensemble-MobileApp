import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: '#8A93A3',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none', // ← HIDE THE TAB BAR
        },
      }}>
      {/* Keep all your screens but the tab bar won't show */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="store" options={{ title: 'Store' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="jobs" options={{ href: null }} />
      <Tabs.Screen name="top-up" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="verification" options={{ href: null }} />
    </Tabs>
  );
}
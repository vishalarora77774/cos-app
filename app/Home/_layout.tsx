import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';

export default function TabLayout() {
  const { settings, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarLabelStyle: {
          marginTop: getScaledFontSize(4), // Scale the spacing between icon and title
          fontSize: getScaledFontSize(12),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(28)} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(28)} name="calendar" color={color}  />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(28)} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="today-schedule"
        options={{
          title: "Today's Schedule",
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(28)} name="calendar" color={color} />,
          href: null,
        }}
      />
    </Tabs>
  );
}

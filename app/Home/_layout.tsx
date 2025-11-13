import { Tabs } from 'expo-router';
import React from 'react';

import { CustomScrollableTabBar } from '@/components/custom-scrollable-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccessibility } from '@/stores/accessibility-store';

export default function TabLayout() {
  const { getScaledFontSize } = useAccessibility();

  return (
    <Tabs
      tabBar={(props) => <CustomScrollableTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(24)} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(24)} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(24)} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(24)} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="today-schedule"
        options={{
          title: "Today's Schedule",
          tabBarIcon: ({ color }) => <IconSymbol size={getScaledFontSize(24)} name="calendar" color={color} />,
          href: null
        }}
      />
    </Tabs>
  );
}

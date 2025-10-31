import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, List, Text, Icon } from 'react-native-paper';

export default function AppointmentsModalScreen() {
  const appointments = [
    {
      id: '1',
      title: 'Therapy Session',
      description: 'Mon, Nov 20 · 10:00 AM',
      icon: 'calendar-clock',
      type: 'therapy'
    },
    {
      id: '2',
      title: 'Annual Check-up',
      description: 'Wed, Nov 22 · 2:00 PM',
      icon: 'stethoscope',
      type: 'checkup'
    },
    {
      id: '3',
      title: 'Dental Cleaning',
      description: 'Fri, Nov 24 · 11:30 AM',
      icon: 'tooth',
      type: 'dental'
    },
    {
      id: '4',
      title: 'Eye Exam',
      description: 'Mon, Nov 27 · 3:15 PM',
      icon: 'eye',
      type: 'eye'
    },
    {
      id: '5',
      title: 'Blood Work',
      description: 'Wed, Nov 29 · 9:00 AM',
      icon: 'test-tube',
      type: 'lab'
    }
  ];

  const { settings, increaseFontSize, decreaseFontSize, toggleBoldText, toggleTheme, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];

  const closeModal = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <Text style={{ fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any, color: colors.text }}>All Appointments</Text>
        <TouchableOpacity onPress={closeModal}>
          <IconSymbol name="xmark" size={getScaledFontSize(24)} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.appointmentsList}>
          {appointments.map((appointment, index) => (
            <React.Fragment key={appointment.id}>
              <Card style={styles.appointmentCard}>
                <List.Item
                  title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>{appointment.title}</Text>}
                  description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.description}</Text>}
                  left={(props) => <Icon {...props} source={appointment.icon} size={getScaledFontSize(40)} />}
                  right={(props) => (
                    <View style={styles.typeBadge}>
                      <Text style={[styles.typeText, { fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any  }]}>{appointment.type}</Text>
                    </View>
                  )}
                />
              </Card>
              {index < appointments.length - 1 && <View style={styles.cardSpacing} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContainer: {
    padding: 16,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSpacing: {
    height: 8,
  },
  typeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  typeText: {
    color: '#1976d2',
    textTransform: 'capitalize',
  },
});

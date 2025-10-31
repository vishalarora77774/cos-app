import { AppWrapper } from '@/components/app-wrapper';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Card } from 'react-native-paper';

interface Appointment {
  id: string;
  title: string;
  date: Date;
  color: string;
  time: string;
}

export default function AppointmentsScreen() {
  console.log('AppointmentsScreen rendering - Calendar should be visible');
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Sample appointments with random colors
  const appointments: Appointment[] = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const today = new Date();
    const sampleAppointments: Appointment[] = [];

    // Generate some sample appointments for the current month
    for (let i = 0; i < 15; i++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const appointmentDate = new Date(today.getFullYear(), today.getMonth(), randomDay);
      
      sampleAppointments.push({
        id: `appointment-${i}`,
        title: `Appointment ${i + 1}`,
        date: appointmentDate,
        color: colors[Math.floor(Math.random() * colors.length)],
        time: `${randomHour}:00`
      });
    }

    return sampleAppointments;
  }, []);

  // Create marked dates for calendar with multi-dot marking
  const markedDates = useMemo(() => {
    const marked: any = {};
    
    appointments.forEach(appointment => {
      const dateString = appointment.date.toISOString().split('T')[0];
      
      if (!marked[dateString]) {
        marked[dateString] = {
          dots: []
        };
      }
      
      marked[dateString].dots.push({
        color: appointment.color,
        selectedDotColor: appointment.color
      });
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#1976D2'
      };
    }

    return marked;
  }, [appointments, selectedDate]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    
    return appointments.filter(appointment => {
      const appointmentDateString = appointment.date.toISOString().split('T')[0];
      return appointmentDateString === selectedDate;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };


  return (
    <AppWrapper>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { fontSize: getScaledFontSize(28), fontWeight: getScaledFontWeight(600) as any, color: colors.text }]}>Appointments Calendar</Text>
        
        {/* Calendar */}
        <Card style={styles.calendarCard}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#1976D2',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#1976D2',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#1976D2',
              monthTextColor: '#2d4150',
              indicatorColor: '#1976D2',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: getScaledFontWeight(300) as any,
              textMonthFontWeight: getScaledFontWeight(600) as any,
              textDayHeaderFontWeight: getScaledFontWeight(300) as any,
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </Card>

        {/* Selected Date Appointments */}
        <Card style={styles.appointmentsListCard}>
          <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), fontWeight: getScaledFontWeight(600) as any }]}>
            Appointments for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Selected Date'}
          </Text>
          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentItem}>
                <View style={[styles.appointmentColor, { backgroundColor: appointment.color }]} />
                <View style={styles.appointmentDetails}>
                  <Text style={[styles.appointmentTitle, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>{appointment.title}</Text>
                  <Text style={[styles.appointmentDate, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
                    {appointment.time}  
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noAppointmentsContainer}>
              <Text style={[styles.noAppointmentsText, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>No appointments scheduled for this date</Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  calendarCard: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendar: {
    borderRadius: 8,
  },
  appointmentsListCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    color: '#333',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appointmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  noAppointmentsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, List, Text, Icon } from 'react-native-paper';
import { Appointment as FastenAppointment, transformFastenHealthData } from '@/services/fasten-health';

export default function AppointmentsModalScreen() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const [appointments, setAppointments] = React.useState<FastenAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = React.useState(false);

  React.useEffect(() => {
    const loadUpcomingAppointments = async () => {
      setIsLoadingAppointments(true);
      try {
        const healthData = await transformFastenHealthData();
        const allAppointments = healthData.appointments || [];
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 15);

        const upcoming = allAppointments
          .map(apt => {
            const dateObj = new Date(apt.date);
            if (apt.time) {
              const timeMatch = apt.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (timeMatch) {
                let hour = parseInt(timeMatch[1], 10);
                const minute = parseInt(timeMatch[2], 10);
                const meridiem = timeMatch[3].toUpperCase();
                if (meridiem === 'PM' && hour !== 12) {
                  hour += 12;
                } else if (meridiem === 'AM' && hour === 12) {
                  hour = 0;
                }
                dateObj.setHours(hour, minute, 0, 0);
              }
            }
            return { apt, dateObj };
          })
          .filter(({ dateObj }) => dateObj >= start && dateObj <= end)
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
          .map(({ apt }) => apt);

        setAppointments(upcoming);
      } catch (error) {
        console.error('Error loading upcoming appointments:', error);
        setAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadUpcomingAppointments();
  }, []);

  const getAppointmentIcon = (appointment: FastenAppointment) => {
    const type = (appointment.type || '').toLowerCase();
    if (type.includes('therapy')) return 'calendar-clock';
    if (type.includes('dental') || type.includes('tooth')) return 'tooth';
    if (type.includes('eye')) return 'eye';
    if (type.includes('blood') || type.includes('lab')) return 'test-tube';
    if (type.includes('check') || type.includes('follow')) return 'stethoscope';
    return 'calendar';
  };

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
        {isLoadingAppointments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={{ fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any, color: colors.text }}>
              Loading appointments...
            </Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any, color: colors.text }}>
              No upcoming appointments in the next 15 days.
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment, index) => {
              const appointmentDate = new Date(appointment.date);
              const dateLabel = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const title = appointment.doctorName
                ? `${appointment.type || 'Appointment'} - ${appointment.doctorName}`
                : appointment.type || 'Appointment';
              const description = `${dateLabel} · ${appointment.time}`;
              return (
                <React.Fragment key={appointment.id}>
                  <Card style={[styles.appointmentCard, { backgroundColor: colors.background }]}>
                    <List.Item
                      title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any, color: colors.text }]}>{title}</Text>}
                      description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any, color: colors.text }]}>{description}</Text>}
                      left={(props) => <Icon {...props} source={getAppointmentIcon(appointment)} size={getScaledFontSize(40)} color={colors.tint} />}
                      right={() => (
                        <View style={[styles.typeBadge, { backgroundColor: colors.tint + '20' }]}>
                          <Text style={[styles.typeText, { fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any, color: colors.tint }]}>{(appointment.type || 'appointment').toLowerCase()}</Text>
                        </View>
                      )}
                    />
                  </Card>
                  {index < appointments.length - 1 && <View style={styles.cardSpacing} />}
                </React.Fragment>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  cardSpacing: {
    height: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  typeText: {
    textTransform: 'capitalize',
  },
});

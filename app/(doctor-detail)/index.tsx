import { DoctorCard } from '@/components/ui/doctor-card';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Card } from 'react-native-paper';

export default function DoctorDetailScreen() {
  const params = useLocalSearchParams();
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const doctorName = params.name as string || 'Dr. Max K.';
  const doctorImage = require('@/assets/images/dummy.jpg');

  const [activeTab, setActiveTab] = useState('treatment');
  const [doctorShares, setDoctorShares] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: true,
    4: false,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { id: 'treatment', label: 'Treatment Diagnosis Plan' },
    { id: 'share', label: 'Share Data' },
    { id: 'appointments', label: 'Appointments' },
  ];

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    
    // Auto-scroll to center the active tab
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1 && scrollViewRef.current) {
      const tabWidth = 120 + 40; // minWidth + paddingHorizontal * 2
      const scrollPosition = Math.max(0, (tabIndex * tabWidth) - (tabWidth / 2));
      
      scrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  };

  const treatmentPlans = [
    {
      id: 1,
      title: 'Current Treatment Diagnosis Plan',
      status: 'Active',
      date: 'Started Nov 15, 2024',
      diagnosis: 'Chronic lower back pain with muscle tension and limited range of motion',
      description: 'Physical therapy for lower back pain with weekly sessions',
      medications: ['Ibuprofen 400mg', 'Muscle relaxant'],
    },
    {
      id: 2,
      title: 'Previous Treatment Diagnosis Plan',
      status: 'Completed',
      date: 'Aug 10 - Nov 14, 2024',
      diagnosis: 'Acute lower back pain with suspected disc involvement',
      description: 'Initial assessment and pain management',
      medications: ['Acetaminophen 500mg'],
    },
  ];

  const doctors = [
    { id: '1', name: 'Dr. Sarah Johnson', qualifications: 'Cardiologist', image: require('@/assets/images/dummy.jpg') },
    { id: '2', name: 'Dr. Michael Chen', qualifications: 'Orthopedist', image: require('@/assets/images/dummy.jpg') },
    { id: '3', name: 'Dr. Emily Davis', qualifications: 'Neurologist', image: require('@/assets/images/dummy.jpg') },
    { id: '4', name: 'Dr. James Wilson', qualifications: 'Dermatologist', image: require('@/assets/images/dummy.jpg') },
  ];

  const appointments = [
    {
      id: 1,
      date: 'Nov 25, 2024',
      time: '10:00 AM',
      type: 'Follow-up',
      status: 'Confirmed',
    },
    {
      id: 2,
      date: 'Dec 2, 2024',
      time: '2:30 PM',
      type: 'Treatment Session',
      status: 'Confirmed',
    },
    {
      id: 3,
      date: 'Dec 9, 2024',
      time: '11:00 AM',
      type: 'Progress Review',
      status: 'Pending',
    },
  ];

  const renderTreatmentPlan = () => (
    <ScrollView style={styles.tabContent}>
      {treatmentPlans.map((plan) => (
        <Card key={plan.id} style={styles.planCard}>
          <Card.Content>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { fontSize: getScaledFontSize(18), fontWeight: getScaledFontWeight(600) as any }]}>{plan.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: plan.status === 'Active' ? '#4CAF50' : '#9E9E9E' }]}>
                <Text style={[styles.statusText, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{plan.status}</Text>
              </View>
            </View>
            <Text style={[styles.planDate, {  fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{plan.date}</Text>
            <View style={[styles.diagnosisContainer, { marginTop: getScaledFontSize(12), marginBottom: getScaledFontSize(12) }]}>
              <Text style={[styles.diagnosisTitle, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Diagnosis:</Text>
              <Text style={[styles.diagnosis, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]} numberOfLines={0}>{plan.diagnosis}</Text>
            </View>
            <View style={[styles.diagnosisContainer, { marginTop: getScaledFontSize(12), marginBottom: getScaledFontSize(12) }]}>
              <Text style={[styles.diagnosisTitle, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Treatment Recommendations:</Text>
              <Text style={[styles.diagnosis, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]} numberOfLines={0}>{plan.description}</Text>
            </View>
            <Text style={[styles.medicationsTitle, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Medications:</Text>
            {plan.medications.map((med, idx) => (
              <Text key={idx} style={[styles.medication, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>• {med}</Text>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderShareData = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={[styles.sectionSubtitle, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Choose which doctors can access your data</Text>
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          id={doctor.id}
          name={doctor.name}
          qualifications={doctor.qualifications}
          image={doctor.image}
          showSwitch={true}
          switchValue={doctorShares[parseInt(doctor.id)]}
          onSwitchChange={(value) => setDoctorShares(prev => ({ ...prev, [parseInt(doctor.id)]: value }))}
        />
      ))}
    </ScrollView>
  );

  const renderAppointments = () => (
    <ScrollView style={styles.tabContent}>
      {appointments.map((appointment) => (
        <Card key={appointment.id} style={styles.appointmentCard}>
          <Card.Content>
            <View style={styles.appointmentHeader}>
              <View>
                <Text style={[styles.appointmentDate, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.date}</Text>
                <Text style={[styles.appointmentTime, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentRight}>
                <Text style={[styles.appointmentType, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'Confirmed' ? '#4CAF50' : '#FF9800' }]}>
                  <Text style={[styles.statusText, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.status}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Doctor Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Avatar.Image source={doctorImage} size={getScaledFontSize(120)} style={styles.doctorAvatar} />
        <Text style={[styles.doctorName, { color: colors.text, fontSize: getScaledFontSize(24), fontWeight: getScaledFontWeight(600) as any }]}>{doctorName}</Text>
        <Text style={[styles.qualifications, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>MD, Physical Medicine & Rehabilitation</Text>
        <Text style={[styles.specialty, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>Specialist in Pain Management</Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollContainer}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'treatment' && renderTreatmentPlan()}
      {activeTab === 'share' && renderShareData()}
      {activeTab === 'appointments' && renderAppointments()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  doctorAvatar: {
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  qualifications: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialty: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tabScrollContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  planCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  planDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  diagnosisContainer: {
    marginTop: 12,
    marginBottom: 12,
    width: '100%',
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  diagnosis: {
    fontSize: 14,
    color: '#666',
  },
  planDescription: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  medicationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  medication: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appointmentCard: {
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  appointmentRight: {
    alignItems: 'flex-end',
  },
  appointmentType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

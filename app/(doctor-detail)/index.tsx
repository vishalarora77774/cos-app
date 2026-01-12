import { DoctorCard } from '@/components/ui/doctor-card';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking, Alert, Platform } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getFastenPractitionerById, Provider, getProviderDiagnosesAndTreatmentPlans, getProviderProgressNotes, getProviderAppointments, TreatmentPlanItem, ProgressNote, ProviderAppointment } from '@/services/fasten-health';
import { InitialsAvatar } from '@/utils/avatar-utils';

export default function DoctorDetailScreen() {
  const params = useLocalSearchParams();
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlanItem[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Get provider data from params or load by ID
  const providerId = params.id as string | undefined;
  const providerName = params.name as string || 'Dr. Max K.';
  const providerQualifications = params.qualifications as string || 'MD, Physical Medicine & Rehabilitation';
  const providerSpecialty = params.specialty as string || 'General';
  
  const doctorName = provider?.name || providerName;
  const doctorImage = require('@/assets/images/dummy.jpg');

  const [activeTab, setActiveTab] = useState('treatment');
  const [doctorShares, setDoctorShares] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: true,
    4: false,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  // Load provider details and related data if ID is provided
  useEffect(() => {
    const loadProviderData = async () => {
      const effectiveProviderId = providerId || 'unknown';
      
      if (providerId && providerId !== 'unknown') {
        setIsLoadingProvider(true);
        setIsLoadingData(true);
        try {
          const providerData = await getFastenPractitionerById(providerId);
          if (providerData) {
            setProvider(providerData);
          }
          
          // Load provider-specific data
          const [plans, notes, apts] = await Promise.all([
            getProviderDiagnosesAndTreatmentPlans(providerId),
            getProviderProgressNotes(providerId),
            getProviderAppointments(providerId),
          ]);
          
          setTreatmentPlans(plans);
          setProgressNotes(notes);
          setAppointments(apts);
        } catch (error) {
          console.error('Error loading provider data:', error);
        } finally {
          setIsLoadingProvider(false);
          setIsLoadingData(false);
        }
      } else {
        // Use params data if available
        setProvider({
          id: effectiveProviderId,
          name: providerName,
          qualifications: providerQualifications,
          specialty: providerSpecialty,
          phone: params.phone as string,
          email: params.email as string,
        });
        // Set empty arrays for data when no provider ID
        setTreatmentPlans([]);
        setProgressNotes([]);
        setAppointments([]);
      }
    };
    
    loadProviderData();
  }, [providerId, providerName, providerQualifications, providerSpecialty]);

  // Doctor contact information
  const doctorPhone = provider?.phone || params.phone as string || '+1234567890';
  const doctorEmail = provider?.email || params.email as string || 'doctor@example.com';
  const doctorQualifications = provider?.qualifications || providerQualifications;
  const doctorSpecialty = provider?.specialty || providerSpecialty;

  const handleCall = async () => {
    const url = `tel:${doctorPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make a phone call');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make a phone call');
    }
  };

  const handleMessage = async () => {
    const url = `sms:${doctorPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to send a message');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to send a message');
    }
  };

  const handleVideoCall = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Try FaceTime first
        const facetimeUrl = `facetime://${doctorPhone}`;
        const canOpenFaceTime = await Linking.canOpenURL(facetimeUrl);
        if (canOpenFaceTime) {
          await Linking.openURL(facetimeUrl);
          return;
        }
        // Fallback to FaceTime audio
        const facetimeAudioUrl = `facetime-audio://${doctorPhone}`;
        const canOpenAudio = await Linking.canOpenURL(facetimeAudioUrl);
        if (canOpenAudio) {
          await Linking.openURL(facetimeAudioUrl);
          return;
        }
      }
      
      // For Android and iOS fallback, show options
      // The system will show app chooser for these URL schemes if multiple apps are installed
      const videoApps = [
        { name: 'Zoom', url: 'zoomus://' },
        { name: 'Google Meet', url: 'https://meet.google.com' },
        { name: 'Skype', url: 'skype:' },
        { name: 'WhatsApp', url: `whatsapp://send?phone=${doctorPhone}` },
      ];
      
      const availableApps = [];
      for (const app of videoApps) {
        const canOpen = await Linking.canOpenURL(app.url);
        if (canOpen) {
          availableApps.push(app);
        }
      }
      
      if (availableApps.length > 0) {
        Alert.alert(
          'Video Call',
          'Choose a video calling app:',
          [
            { text: 'Cancel', style: 'cancel' },
            ...availableApps.map(app => ({
              text: app.name,
              onPress: () => Linking.openURL(app.url),
            })),
          ]
        );
      } else {
        Alert.alert(
          'Video Call',
          'No video calling apps found. Please install a video calling app like Zoom, Google Meet, or Skype.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to start a video call');
    }
  };

  const handleEmail = async () => {
    const url = `mailto:${doctorEmail}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to send an email');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to send an email');
    }
  };

  const tabs = [
    { id: 'treatment', label: 'Diagnosis & Treatment Plan' },
    { id: 'progress', label: 'Progress Notes' },
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

  // Treatment plans are loaded from Fasten Health

  const doctors = [
    { id: '1', name: 'Dr. Sarah Johnson', qualifications: 'Cardiologist', image: require('@/assets/images/dummy.jpg') },
    { id: '2', name: 'Dr. Michael Chen', qualifications: 'Orthopedist', image: require('@/assets/images/dummy.jpg') },
    { id: '3', name: 'Dr. Emily Davis', qualifications: 'Neurologist', image: require('@/assets/images/dummy.jpg') },
    { id: '4', name: 'Dr. James Wilson', qualifications: 'Dermatologist', image: require('@/assets/images/dummy.jpg') },
  ];

  // Progress notes are loaded from Fasten Health

  // Appointments are loaded from Fasten Health

  const renderTreatmentPlan = () => (
    <ScrollView style={styles.tabContent}>
      {isLoadingData ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>Loading treatment plans...</Text>
        </View>
      ) : treatmentPlans.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>No treatment plans available</Text>
        </View>
      ) : (
        treatmentPlans.map((plan) => (
          <Card key={plan.id} style={styles.planCard}>
            <Card.Content>
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { fontSize: getScaledFontSize(18), fontWeight: getScaledFontWeight(600) as any }]}>{plan.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: plan.status === 'Active' ? '#008080' : '#9E9E9E' }]}>
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
        ))
      )}
    </ScrollView>
  );

  const renderProgressNotes = () => (
    <ScrollView style={styles.tabContent}>
      {isLoadingData ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>Loading progress notes...</Text>
        </View>
      ) : progressNotes.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>No progress notes available</Text>
        </View>
      ) : (
        progressNotes.map((note) => (
        <Card key={note.id} style={styles.progressNoteCard}>
          <Card.Content>
            <View style={styles.progressNoteHeader}>
              <View>
                <Text style={[styles.progressNoteDate, { fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>{note.date}</Text>
                <Text style={[styles.progressNoteTime, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{note.time}</Text>
              </View>
              <Text style={[styles.progressNoteAuthor, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{note.author}</Text>
            </View>
            <Text style={[styles.progressNoteText, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>{note.note}</Text>
          </Card.Content>
        </Card>
        ))
      )}
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
      {isLoadingData ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>Loading appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(14) }]}>No appointments available</Text>
        </View>
      ) : (
        appointments.map((appointment) => (
        <Card key={appointment.id} style={styles.appointmentCard}>
          <Card.Content>
            <View style={styles.appointmentHeader}>
              <View>
                <Text style={[styles.appointmentDate, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.date}</Text>
                <Text style={[styles.appointmentTime, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentRight}>
                <Text style={[styles.appointmentType, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'Confirmed' ? '#008080' : '#FF9800' }]}>
                  <Text style={[styles.statusText, { fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>{appointment.status}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        ))
      )}
    </ScrollView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Doctor Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <InitialsAvatar name={doctorName} size={getScaledFontSize(120)} style={styles.doctorAvatar} />
        <Text style={[styles.doctorName, { color: colors.text, fontSize: getScaledFontSize(24), fontWeight: getScaledFontWeight(600) as any }]}>{doctorName}</Text>
        <Text style={[styles.qualifications, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>{doctorQualifications}</Text>
        {doctorSpecialty && doctorSpecialty !== 'General' && (
          <Text style={[styles.specialty, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
            Specialist in {doctorSpecialty}
          </Text>
        )}
        
        {/* Communication Options */}
        <View style={styles.communicationContainer}>
          <TouchableOpacity 
            style={[styles.communicationButton, { backgroundColor: colors.background }]} 
            onPress={handleCall}
            accessibilityLabel="Call doctor"
            accessibilityRole="button"
          >
            <MaterialIcons name="phone" size={getScaledFontSize(24)} color="#008080" />
            <Text style={[styles.communicationLabel, { color: colors.text, fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.communicationButton, { backgroundColor: colors.background }]} 
            onPress={handleMessage}
            accessibilityLabel="Message doctor"
            accessibilityRole="button"
          >
            <MaterialIcons name="message" size={getScaledFontSize(24)} color="#008080" />
            <Text style={[styles.communicationLabel, { color: colors.text, fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.communicationButton, { backgroundColor: colors.background }]} 
            onPress={handleVideoCall}
            accessibilityLabel="Video call doctor"
            accessibilityRole="button"
          >
            <MaterialIcons name="videocam" size={getScaledFontSize(24)} color="#008080" />
            <Text style={[styles.communicationLabel, { color: colors.text, fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.communicationButton, { backgroundColor: colors.background }]} 
            onPress={handleEmail}
            accessibilityLabel="Email doctor"
            accessibilityRole="button"
          >
            <MaterialIcons name="email" size={getScaledFontSize(24)} color="#008080" />
            <Text style={[styles.communicationLabel, { color: colors.text, fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Mail</Text>
          </TouchableOpacity>
        </View>
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
      {activeTab === 'progress' && renderProgressNotes()}
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
  communicationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 24,
    paddingHorizontal: 16,
  },
  communicationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  communicationLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
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
    backgroundColor: '#008080',
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
  progressNoteCard: {
    marginBottom: 16,
  },
  progressNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressNoteDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressNoteTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressNoteAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  progressNoteText: {
    fontSize: 14,
    color: '#333',
  },
});

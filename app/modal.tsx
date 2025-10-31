import { DoctorCard } from '@/components/ui/doctor-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';


export default function ModalScreen() {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];

  const closeModal = () => {
    router.back();
  };

  const departments = React.useMemo(
    () => [
      {
        id: 'cardiology',
        name: 'Cardiology',
        doctors: [
          { id: 'd1', name: 'Dr. Alice Heart', qualifications: 'MD, FACC', image: require('@/assets/images/dummy.jpg') },
          { id: 'd2', name: 'Dr. Robert Valve', qualifications: 'MD, FSCAI', image: require('@/assets/images/dummy.jpg') },
        ],
      },
      {
        id: 'neurology',
        name: 'Neurology',
        doctors: [
          { id: 'd3', name: 'Dr. Nina Neuron', qualifications: 'MD, FAAN', image: require('@/assets/images/dummy.jpg') },
          { id: 'd4', name: 'Dr. Brian Synapse', qualifications: 'MD, PhD', image: require('@/assets/images/dummy.jpg') },
        ],
      },
      {
        id: 'pediatrics',
        name: 'Pediatrics',
        doctors: [
          { id: 'd5', name: 'Dr. Peter Care', qualifications: 'MD, FAAP', image: require('@/assets/images/dummy.jpg') },
          { id: 'd6', name: 'Dr. Paula Smile', qualifications: 'MD, DCH', image: require('@/assets/images/dummy.jpg') },
        ],
      },
      {
        id: 'orthopedics',
        name: 'Orthopedics',
        doctors: [
          { id: 'd7', name: 'Dr. Olivia Joint', qualifications: 'MS, DNB (Ortho)', image: require('@/assets/images/dummy.jpg') },
          { id: 'd8', name: 'Dr. Max Bone', qualifications: 'MS Ortho', image: require('@/assets/images/dummy.jpg') },
        ],
      },
    ],
    []
  );

  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState(departments[0]?.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.modalTitle, { 
          fontSize: getScaledFontSize(20), 
          fontWeight: getScaledFontWeight(600) as any, 
          color: colors.text 
        }]}>Doctors</Text>
        <TouchableOpacity onPress={closeModal}>
          <IconSymbol name="xmark" size={getScaledFontSize(24)} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <TabsProvider
        defaultIndex={0}
        // onChangeIndex={handleChangeIndex} optional
      >
      <Tabs
        showLeadingSpace={false}
        showTextLabel={true}
        uppercase={true}
        mode="scrollable"
        tabLabelStyle={{ 
          fontSize: getScaledFontSize(14), 
          fontWeight: getScaledFontWeight(500) as any,
          paddingHorizontal: Math.max(8, getScaledFontSize(14) / 2), // Add padding based on font size
          textAlign: 'center' // Center the text
        }}
        dark={settings.isDarkTheme}
      >
        {departments.map((dept) => (
          <TabScreen
            key={dept.id}
            label={dept.name}
          >
            <ScrollView contentContainerStyle={styles.cardsContainer}>
              {dept.doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  qualifications={doc.qualifications}
                  image={doc.image}
                />
              ))}
            </ScrollView>
          </TabScreen>
        ))}
      </Tabs>
      </TabsProvider>
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
  headerSpacer: {
    width: 24, // Same width as the close button to center the title
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabs: {
    height: '100%',
  },
  tabHeader: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 48,
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
});

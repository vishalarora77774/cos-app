import { DoctorCard } from '@/components/ui/doctor-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { getFastenPractitionersByDepartment, Provider } from '@/services/fasten-health';


interface Department {
  id: string;
  name: string;
  doctors: Provider[];
}

export default function ModalScreen() {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const closeModal = () => {
    router.back();
  };

  // Load providers from Fasten Health
  React.useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      try {
        const depts = await getFastenPractitionersByDepartment();
        setDepartments(depts);
        console.log(`Loaded ${depts.length} departments with providers`);
      } catch (error) {
        console.error('Error loading providers:', error);
        // Fallback to empty array or default departments if needed
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, []);

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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: getScaledFontSize(14) }]}>
            Loading providers...
          </Text>
        </View>
      ) : departments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text, fontSize: getScaledFontSize(16) }]}>
            No providers available
          </Text>
        </View>
      ) : (
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
              textAlign: 'center', // Center the text
              lineHeight: getScaledFontSize(20) // Add line height
            }}
            dark={settings.isDarkTheme}
          >
            {departments.map((dept) => (
              <TabScreen
                key={dept.id}
                label={dept.name}
              >
                <ScrollView contentContainerStyle={styles.cardsContainer}>
                  {dept.doctors.length === 0 ? (
                    <View style={styles.emptyDepartmentContainer}>
                      <Text style={[styles.emptyText, { color: colors.text, fontSize: getScaledFontSize(14) }]}>
                        No providers in this department
                      </Text>
                    </View>
                  ) : (
                    dept.doctors.map((provider) => (
                      <DoctorCard
                        key={provider.id}
                        id={provider.id}
                        name={provider.name}
                        qualifications={provider.qualifications || 'Healthcare Provider'}
                        image={provider.image || undefined}
                      />
                    ))
                  )}
                </ScrollView>
              </TabScreen>
            ))}
          </Tabs>
        </TabsProvider>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyDepartmentContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

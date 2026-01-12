import { AppWrapper } from '@/components/app-wrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { SUPPORT_CATEGORIES, getSubCategoriesByCategoryId, getCategoryById, getSubCategoryById, matchProviderToSubCategory, type Category, type SubCategory } from '@/constants/categories';
import { useAccessibility } from '@/stores/accessibility-store';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, List } from 'react-native-paper';
import { getFastenPractitioners, getFastenPractitionersByDepartment, Provider as FastenProvider, getFastenPatient } from '@/services/fasten-health';
import { InitialsAvatar } from '@/utils/avatar-utils';

// Helper function to detect if device is a tablet
const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768; // iPad starts at 768px width
};

// Helper function to format provider name for display (filters out credentials/titles)
const formatProviderDisplayName = (fullName: string): string => {
  if (!fullName) return '';
  
  // Common titles and credentials to filter out
  const titlesAndCredentials = ['Dr.', 'Dr', 'MD', 'DO', 'RN', 'NP', 'PA', 'PA-C', 'DDS', 'DMD', 'PharmD', 'PhD', 'DNP', 'FNP', 'CNP'];
  
  // Split name into parts
  const parts = fullName.trim().split(/\s+/);
  
  // Filter out titles and credentials
  const nameParts = parts.filter(part => {
    const normalizedPart = part.replace(/[.,]/g, ''); // Remove punctuation
    return !titlesAndCredentials.includes(normalizedPart);
  });
  
  // If no name parts left after filtering, return original (fallback)
  if (nameParts.length === 0) {
    return fullName;
  }
  
  // Get first name (first part) and last initial (first character of last part)
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const lastInitial = lastName?.[0] || '';
  
  // Return formatted as "FirstName L" (e.g., "Subhash M" for "Subhash Mishra")
  return `${firstName} ${lastInitial}`.trim();
};

type DoctorRole = 'provider' | 'care_manager' | 'doctor_on_demand';

interface Doctor {
  key: number;
  role: DoctorRole;
}

interface CircleViewProps {
  doctors: Array<Doctor>;
  userImg: any;
  colors: any;
  getScaledFontSize: (size: number) => number;
  getScaledFontWeight: (weight: number) => string | number;
  fastenProviders?: FastenProvider[];
  patientName?: string;
}

// Original Circle View for iPhone/Android (fixed dimensions)
function PhoneCircleView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight, fastenProviders = [], patientName = 'Jenny Wilson' }: CircleViewProps) {
  // Original fixed values
  const containerWidth = 384;
  const containerHeight = 320;
  const radius = 144 * 1.2; // 158.4
  const centerAvatarSize = 80;
  const orbitAvatarSize = 48;
  const orbitAvatarContainerSize = 120;
  const linkLineWidth = 92;

  return (
    <View style={[styles.circleContainer, { width: containerWidth, height: containerHeight, alignItems: 'center', justifyContent: 'center' }]}>
      <Image
        source={require('@/assets/images/backgroud.png')}
        style={styles.background}
        contentFit='contain' />
      {/* Circular line connecting the orbiting avatars */}
      <View
        style={{
          position: 'absolute',
          width: radius * 2, // diameter = 2 * radius (radius is 144 * 1.2 = 172.8)
          height: radius * 2,
          borderRadius: radius,
          borderWidth: 2,
          borderColor: '#008080',
          borderStyle: 'dashed',
          left: (containerWidth - radius * 2) / 2,
          top: (containerHeight - radius * 2) / 2,
          zIndex: 0,
        }} />
      <View style={styles.centerAvatarWrapper}>
        <TouchableOpacity 
          onPress={() => router.push('/Home/today-schedule')}
          activeOpacity={0.8}
        >
          <InitialsAvatar name={patientName} size={getScaledFontSize(centerAvatarSize)} style={styles.centerAvatarImage} />
        </TouchableOpacity>
        <Text style={[
          styles.centerAvatarText,
          {
            fontSize: getScaledFontSize(16),
            fontWeight: getScaledFontWeight(600) as any,
            color: colors.text,
          }
        ]}>{patientName}</Text>
      </View>
      <Button 
        mode="contained" 
        buttonColor="#008080"
        onPress={() => router.push('/modal')} 
        style={styles.moreDoctorsButton}>
        More
      </Button>
      {doctors.map((u, idx) => {
        const angle = (idx / doctors.length) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isCareManager = u.role === 'care_manager';
        const avatarSize = isCareManager ? orbitAvatarSize * 1.35 : orbitAvatarSize;
        const containerSize = isCareManager ? orbitAvatarContainerSize * 1.35 : orbitAvatarContainerSize;
        const halfContainerSize = containerSize / 2;
        return (
          <React.Fragment key={`doctor-${u.key}`}>
            <View
              style={[
                styles.linkLine,
                {
                  width: linkLineWidth,
                  transform: [
                    { rotate: `${(angle * 180) / Math.PI}deg` },
                  ],
                },
              ]} />
            <TouchableOpacity
              style={[
                styles.orbitAvatar,
                {
                  position: 'absolute',
                  left: containerWidth / 2 + x - halfContainerSize,
                  top: containerHeight / 2 + y - halfContainerSize,
                  zIndex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: containerSize,
                  height: containerSize,
                },
              ]}
              onPress={() => {
                const provider = fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length];
                if (provider) {
                  router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
                } else {
                  router.push('/(doctor-detail)?name=Dr. Max K.');
                }
              }}
            >
              <InitialsAvatar
                name={fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length] 
                  ? fastenProviders[idx % fastenProviders.length].name
                  : 'Kendrick L.'}
                size={getScaledFontSize(avatarSize)}
              />
              <Text 
                numberOfLines={2}
                style={[
                  styles.orbitAvatarText,
                  {
                    fontSize: getScaledFontSize(12),
                    fontWeight: getScaledFontWeight(500) as any,
                    color: colors.text,
                    width: 90,
                    textAlign: 'center'
                  }
                ]}>
                {fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length] 
                  ? formatProviderDisplayName(fastenProviders[idx % fastenProviders.length].name)
                  : 'Kendrick L.'}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Responsive Circle View for iPad/Tablet
function TabletCircleView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight, fastenProviders = [], patientName = 'Jenny Wilson' }: CircleViewProps) {
  // Get screen dimensions and calculate scale factor
  const screenWidth = Dimensions.get('window').width;
  // Horizontal padding from circleSection (24 on each side = 48 total)
  const horizontalPadding = 24;
  // Maximum available width for the circle container
  const maxAvailableWidth = screenWidth - horizontalPadding;
  
  // Base width for iPhone (375 is typical iPhone width)
  const baseWidth = 375;
  // Calculate scale factor, but cap it for very large screens (max 2.2x for iPad)
  const scaleFactor = Math.min(screenWidth / baseWidth, 2.2);
  
  // Base radius for orbit - original design value
  const baseRadius = 144 * 1.1; // ~158.4
  
  // Avatar container size - scale proportionally
  const baseAvatarContainerSize = 120;
  const avatarContainerSize = baseAvatarContainerSize * Math.min(scaleFactor, 1.5);
  const containerPadding = 1;
  
  // Calculate maximum radius that fits within available width
  // Increased containerPadding to allow more space between center and orbiting circles
  const adjustedContainerPadding = containerPadding * 1.5;
  const maxRadius = (maxAvailableWidth - avatarContainerSize - (adjustedContainerPadding * 2)) / 2;
  
  // Avatar sizes - scale less aggressively than the circle (calculate early for radius calculation)
  const centerAvatarSize = 80 * Math.min(scaleFactor, 1.5);
  
  // Adaptive multiplier based on screen width - larger screens get more spacing
  // 11-inch iPad: ~834px width, 13-inch iPad: ~1024px width
  // Use a progressive multiplier that scales with screen size
  const screenWidthRatio = screenWidth / 834; // Normalize to 11-inch iPad
  const adaptiveMultiplier = Math.min(2.5 + (screenWidthRatio - 1) * 0.1, 2.592); // Range from 2.5 to 2.592
  
  // Calculate minimum radius to prevent overlapping with center avatar
  // Need enough space for center avatar + orbiting avatar + padding
  const maxContainerSize = Math.max(...doctors.map(d => d.role === 'care_manager' ? avatarContainerSize * 1.35 : avatarContainerSize));
  const minRadiusFromCenter = (centerAvatarSize / 2) + (maxContainerSize / 2) + 80; // 80px padding between center and orbit
  
  // Calculate minimum radius to prevent overlapping between orbiting doctors
  // Each doctor needs space around the circle: we need enough circumference for all doctors
  const minRadiusForSpacing = (maxContainerSize * doctors.length * 1.5) / (2 * Math.PI);
  
  // Scale radius more aggressively for larger screens - increased multiplier for more spacing
  const desiredRadius = baseRadius * scaleFactor * adaptiveMultiplier;
  // Use the larger of: desired radius, minimum from center, or minimum for spacing
  const radius = Math.min(Math.max(desiredRadius, minRadiusFromCenter, minRadiusForSpacing), maxRadius);
  
  // Calculate container size based on actual radius
  const containerWidth = (radius * 2) + avatarContainerSize + (adjustedContainerPadding * 2);
  const containerHeight = containerWidth; // Keep it square
  const orbitAvatarSize = 48 * Math.min(scaleFactor, 1.5);
  const orbitAvatarContainerSize = avatarContainerSize;
  const linkLineWidth = 92 * Math.min(scaleFactor, 1.5);

  return (
    <View style={[styles.circleContainer, { width: containerWidth, height: containerHeight, alignItems: 'center', justifyContent: 'center' }]}>
      <Image
        source={require('@/assets/images/backgroud.png')}
        style={styles.background}
        contentFit='contain' />
      {/* Circular line connecting the orbiting avatars */}
      <View
        style={{
          position: 'absolute',
          width: radius * 2, // diameter = 2 * radius
          height: radius * 2,
          borderRadius: radius,
          borderWidth: 4,
          borderColor: '#008080',
          borderStyle: 'dashed',
          left: (containerWidth - radius * 2) / 2,
          top: (containerHeight - radius * 2) / 2,
          zIndex: 0,
        }} />
      <View style={styles.centerAvatarWrapper}>
        <TouchableOpacity 
          onPress={() => router.push('/Home/today-schedule')}
          activeOpacity={0.8}
        >
          <InitialsAvatar name={patientName} size={getScaledFontSize(centerAvatarSize)} style={styles.centerAvatarImage} />
        </TouchableOpacity>
        <Text style={[
          styles.centerAvatarText,
          {
            fontSize: getScaledFontSize(16 * Math.min(scaleFactor, 1.5)),
            fontWeight: getScaledFontWeight(600) as any,
            color: colors.text,
          }
        ]}>{patientName}</Text>
      </View>
      <Button 
        labelStyle={{ 
          fontSize: getScaledFontSize(12), 
          fontWeight: getScaledFontWeight(500) as any, 
          lineHeight: getScaledFontSize(16) 
        }} 
        mode="contained" 
        buttonColor="#008080"
        onPress={() => router.push('/modal')} 
        style={[
          styles.moreDoctorsButton,
          {
            paddingHorizontal: getScaledFontSize(20),
            borderRadius: getScaledFontSize(24),
          }
        ]}>
        More
      </Button>
      {doctors.map((u, idx) => {
        const angle = (idx / doctors.length) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isCareManager = u.role === 'care_manager';
        const avatarSize = isCareManager ? orbitAvatarSize * 1.35 : orbitAvatarSize;
        const containerSize = isCareManager ? orbitAvatarContainerSize * 1.35 : orbitAvatarContainerSize;
        const halfContainerSize = containerSize / 2;
        return (
          <React.Fragment key={`doctor-${u.key}`}>
            <View
              style={[
                styles.linkLine,
                {
                  width: linkLineWidth,
                  transform: [
                    { rotate: `${(angle * 180) / Math.PI}deg` },
                  ],
                },
              ]} />
            <TouchableOpacity
              style={[
                styles.orbitAvatar,
                {
                  position: 'absolute',
                  left: containerWidth / 2 + x - halfContainerSize,
                  top: containerHeight / 2 + y - halfContainerSize,
                  zIndex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: containerSize,
                  paddingHorizontal: 4,
                  height: containerSize,
                },
              ]}
              onPress={() => {
                const provider = fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length];
                if (provider) {
                  router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
                } else {
                  router.push('/(doctor-detail)?name=Dr. Max K.');
                }
              }}
            >
              <InitialsAvatar
                name={fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length] 
                  ? fastenProviders[idx % fastenProviders.length].name
                  : 'Kendrick L.'}
                size={getScaledFontSize(avatarSize)}
              />
              <Text 
                style={[
                  styles.orbitAvatarText,
                  {
                    fontSize: getScaledFontSize(12 * Math.min(scaleFactor, 1.5)),
                    fontWeight: getScaledFontWeight(500) as any,
                    color: colors.text,
                    textAlign: 'center',
                  }
                ]}>
                {fastenProviders.length > 0 && fastenProviders[idx % fastenProviders.length] 
                  ? formatProviderDisplayName(fastenProviders[idx % fastenProviders.length].name)
                  : 'Kendrick L.'}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Function to generate random doctors array with roles
const generateDoctors = (isTablet: boolean): Doctor[] => {
  // Determine count range based on device type
  const minCount = 5;
  // Limit to 8 for both phones and iPad/tablets
  const maxCount = 8;
  
  // Generate random count within range
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  
  // Create array of doctors
  const doctors: Doctor[] = [];
  
  // Always add exactly 1 care manager
  doctors.push({ key: 0, role: 'care_manager' });
  
  // Fill remaining slots with other roles
  const remainingCount = count - 1;
  const otherRoles: DoctorRole[] = ['provider', 'doctor_on_demand'];
  
  for (let i = 1; i <= remainingCount; i++) {
    // Randomly assign provider or doctor_on_demand
    const randomRole = otherRoles[Math.floor(Math.random() * otherRoles.length)];
    doctors.push({ key: i, role: randomRole });
  }
  
  // Shuffle the array to randomize care manager position
  for (let i = doctors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doctors[i], doctors[j]] = [doctors[j], doctors[i]];
  }
  
  return doctors;
};

// Default provider data structure (fallback)
const defaultDepartments = [
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
];

// Circle Providers List View Component (shows providers from circle)
interface CircleProvidersListViewProps {
  doctors: Array<Doctor>;
  userImg: any;
  colors: any;
  getScaledFontSize: (size: number) => number;
  getScaledFontWeight: (weight: number) => string | number;
  fastenProviders?: FastenProvider[];
  patientName?: string;
}

function CircleProvidersListView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight, fastenProviders = [], patientName = 'Jenny Wilson' }: CircleProvidersListViewProps) {
  // Calculate max height to push appointments to bottom of screen
  const screenHeight = Dimensions.get('window').height;
  const maxListHeight = Math.min(screenHeight * 0.65, 600);

  return (
    <View style={styles.listContainer}>
      <ScrollView
        style={[
          styles.listScrollView,
          {
            maxHeight: maxListHeight,
            borderWidth: 1,
            borderColor: colors.text + '15',
            borderRadius: getScaledFontSize(12),
          }
        ]}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <TouchableOpacity
          style={[
            styles.listItem,
            {
              borderBottomColor: colors.text + '20',
              paddingVertical: getScaledFontSize(16),
              paddingHorizontal: getScaledFontSize(16),
            }
          ]}
          onPress={() => router.push('/Home/today-schedule')}
          activeOpacity={0.7}
        >
          <InitialsAvatar name={patientName} size={getScaledFontSize(56)} style={styles.listAvatar} />
          <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
            <Text style={[
              styles.listItemName,
              {
                fontSize: getScaledFontSize(16),
                fontWeight: getScaledFontWeight(600) as any,
                color: colors.text,
                marginBottom: getScaledFontSize(4),
              }
            ]}>{patientName}</Text>
            <Text style={[
              styles.listItemRole,
              {
                fontSize: getScaledFontSize(14),
                fontWeight: getScaledFontWeight(400) as any,
                color: colors.text + '80',
              }
            ]}>Patient</Text>
          </View>
        </TouchableOpacity>
        {doctors.map((doctor) => {
          const isCareManager = doctor.role === 'care_manager';
          const roleLabel = isCareManager ? 'Care Manager' : doctor.role === 'provider' ? 'Provider' : 'Doctor on Demand';
          return (
            <TouchableOpacity
              key={`circle-provider-${doctor.key}`}
              style={[
                styles.listItem,
                {
                  borderBottomColor: colors.text + '20',
                  paddingVertical: getScaledFontSize(16),
                  paddingHorizontal: getScaledFontSize(16),
                }
              ]}
              onPress={() => {
                const provider = fastenProviders.length > 0 && fastenProviders[doctor.key % fastenProviders.length];
                if (provider) {
                  router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
                } else {
                  router.push('/(doctor-detail)?name=Dr. Max K.');
                }
              }}
              activeOpacity={0.7}
            >
              <InitialsAvatar 
                name={fastenProviders.length > 0 && fastenProviders[doctor.key % fastenProviders.length] 
                  ? fastenProviders[doctor.key % fastenProviders.length].name
                  : 'Kendrick L.'}
                size={getScaledFontSize(56)} 
                style={styles.listAvatar} 
              />
              <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
                <Text style={[
                  styles.listItemName,
                  {
                    fontSize: getScaledFontSize(16),
                    fontWeight: getScaledFontWeight(600) as any,
                    color: colors.text,
                    marginBottom: getScaledFontSize(4),
                  }
                ]}>
                  {fastenProviders.length > 0 && fastenProviders[doctor.key % fastenProviders.length] 
                    ? formatProviderDisplayName(fastenProviders[doctor.key % fastenProviders.length].name)
                    : 'Kendrick L.'}
                </Text>
                <Text style={[
                  styles.listItemRole,
                  {
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(400) as any,
                    color: colors.text + '80',
                  }
                ]}>{roleLabel}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={[
          styles.moreButtonContainer,
          {
            paddingVertical: getScaledFontSize(16),
            paddingHorizontal: getScaledFontSize(16),
          }
        ]}>
          <Button 
            mode="contained" 
            buttonColor="#008080"
            onPress={() => router.push('/modal')} 
            style={styles.moreDoctorsButton}
            labelStyle={{ 
              fontSize: getScaledFontSize(14), 
              fontWeight: getScaledFontWeight(500) as any, 
            }}
          >
            More
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

// List View Component (categories -> sub-categories -> providers)
interface ListViewProps {
  doctors: Array<Doctor>;
  userImg: any;
  colors: any;
  getScaledFontSize: (size: number) => number;
  getScaledFontWeight: (weight: number) => string | number;
  onItemPress: (categoryId?: string, subCategoryId?: string) => void;
  fastenProviders?: FastenProvider[];
  patientName?: string;
}

type ListViewLevel = 'categories' | 'sub-categories' | 'providers';

function ListView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight, onItemPress, fastenProviders = [], patientName = 'Jenny Wilson' }: ListViewProps) {
  // Calculate max height to push appointments to bottom of screen
  const screenHeight = Dimensions.get('window').height;
  // Use larger percentage to push appointments section to bottom
  const maxListHeight = Math.min(screenHeight * 0.65, 600); // Max 65% of screen or 600px, whichever is smaller

  const [currentLevel, setCurrentLevel] = useState<ListViewLevel>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | undefined>(undefined);
  const [providersBySubCategory, setProvidersBySubCategory] = useState<Map<string, FastenProvider[]>>(new Map());
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Load and categorize providers
  React.useEffect(() => {
    const loadAndCategorizeProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const providers = await getFastenPractitioners();
        const categorizedProviders = new Map<string, FastenProvider[]>();
        
        // Categorize each provider
        providers.forEach(provider => {
          const match = matchProviderToSubCategory(
            provider.name,
            provider.specialty,
            provider.qualifications
          );
          
          if (match) {
            const key = `${match.categoryId}-${match.subCategoryId}`;
            if (!categorizedProviders.has(key)) {
              categorizedProviders.set(key, []);
            }
            categorizedProviders.get(key)!.push(provider);
          }
        });
        
        setProvidersBySubCategory(categorizedProviders);
        console.log(`Categorized ${providers.length} providers into ${categorizedProviders.size} sub-categories`);
      } catch (error) {
        console.error('Error loading and categorizing providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    
    loadAndCategorizeProviders();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentLevel('sub-categories');
  };

  const handleSubCategoryPress = (categoryId: string, subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    setCurrentLevel('providers');
    onItemPress(categoryId, subCategoryId);
  };

  const handleBack = () => {
    if (currentLevel === 'providers') {
      setCurrentLevel('sub-categories');
      setSelectedSubCategoryId(undefined);
    } else if (currentLevel === 'sub-categories') {
      setCurrentLevel('categories');
      setSelectedCategoryId(undefined);
    }
  };

  const getCurrentProviders = (): FastenProvider[] => {
    if (!selectedCategoryId || !selectedSubCategoryId) return [];
    const key = `${selectedCategoryId}-${selectedSubCategoryId}`;
    return providersBySubCategory.get(key) || [];
  };

  const renderCategories = () => (
    <>
      <TouchableOpacity
        style={[
          styles.listItem,
          {
            borderBottomColor: colors.text + '20',
            paddingVertical: getScaledFontSize(16),
            paddingHorizontal: getScaledFontSize(16),
          }
        ]}
        onPress={() => router.push('/Home/today-schedule')}
        activeOpacity={0.7}
      >
        <InitialsAvatar name={patientName} size={getScaledFontSize(56)} style={styles.listAvatar} />
        <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
          <Text style={[
            styles.listItemName,
            {
              fontSize: getScaledFontSize(16),
              fontWeight: getScaledFontWeight(600) as any,
              color: colors.text,
              marginBottom: getScaledFontSize(4),
            }
          ]}>{patientName}</Text>
          <Text style={[
            styles.listItemRole,
            {
              fontSize: getScaledFontSize(14),
              fontWeight: getScaledFontWeight(400) as any,
              color: colors.text + '80',
            }
          ]}>Patient</Text>
        </View>
      </TouchableOpacity>
      {SUPPORT_CATEGORIES.map((category) => {
        // Count providers in this category
        const categoryProviderCount = Array.from(providersBySubCategory.entries())
          .filter(([key]) => key.startsWith(`${category.id}-`))
          .reduce((sum, [, providers]) => sum + providers.length, 0);
        
        // Don't render categories with no providers
        if (categoryProviderCount === 0) {
          return null;
        }
        
        return (
          <TouchableOpacity
            key={`category-${category.id}`}
            style={[
              styles.listItem,
              {
                borderBottomColor: colors.text + '20',
                paddingVertical: getScaledFontSize(16),
                paddingHorizontal: getScaledFontSize(16),
              }
            ]}
            onPress={() => handleCategoryPress(category.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.listAvatar,
              {
                width: getScaledFontSize(56),
                height: getScaledFontSize(56),
                borderRadius: getScaledFontSize(28),
                backgroundColor: colors.tint + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}>
              <IconSymbol name="building.2" size={getScaledFontSize(28)} color={colors.tint || '#008080'} />
            </View>
            <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
              <Text style={[
                styles.listItemName,
                {
                  fontSize: getScaledFontSize(16),
                  fontWeight: getScaledFontWeight(600) as any,
                  color: colors.text,
                  marginBottom: getScaledFontSize(4),
                }
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.listItemRole,
                {
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(400) as any,
                  color: colors.text + '80',
                }
              ]}>
                {categoryProviderCount} {categoryProviderCount === 1 ? 'provider' : 'providers'}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={getScaledFontSize(20)} color={colors.text + '60'} />
          </TouchableOpacity>
        );
      })}
    </>
  );

  const renderSubCategories = () => {
    if (!selectedCategoryId) return null;
    const category = getCategoryById(selectedCategoryId);
    if (!category) return null;

    return (
      <>
        <View style={[
          styles.detailsListHeader,
          {
            borderBottomColor: colors.text + '20',
            paddingHorizontal: getScaledFontSize(16),
            paddingVertical: getScaledFontSize(12),
            marginBottom: getScaledFontSize(8),
          }
        ]}>
          <TouchableOpacity onPress={handleBack} style={{ padding: getScaledFontSize(4) }}>
            <IconSymbol name="chevron.right" size={getScaledFontSize(24)} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[
            styles.detailsListTitle,
            {
              fontSize: getScaledFontSize(18),
              fontWeight: getScaledFontWeight(600) as any,
              color: colors.text,
              flex: 1,
              marginLeft: getScaledFontSize(8),
            }
          ]}>
            {category.name}
          </Text>
        </View>
        {category.subCategories.map((subCategory) => {
          const key = `${category.id}-${subCategory.id}`;
          const providerCount = providersBySubCategory.get(key)?.length || 0;
          
          // Don't render sub-categories with no providers
          if (providerCount === 0) {
            return null;
          }
          
          return (
            <TouchableOpacity
              key={`subcategory-${subCategory.id}`}
              style={[
                styles.listItem,
                {
                  borderBottomColor: colors.text + '20',
                  paddingVertical: getScaledFontSize(16),
                  paddingHorizontal: getScaledFontSize(16),
                }
              ]}
              onPress={() => handleSubCategoryPress(category.id, subCategory.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.listAvatar,
                {
                  width: getScaledFontSize(56),
                  height: getScaledFontSize(56),
                  borderRadius: getScaledFontSize(28),
                  backgroundColor: colors.tint + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]}>
                <IconSymbol name="person.2" size={getScaledFontSize(28)} color={colors.tint || '#008080'} />
              </View>
              <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
                <Text style={[
                  styles.listItemName,
                  {
                    fontSize: getScaledFontSize(16),
                    fontWeight: getScaledFontWeight(600) as any,
                    color: colors.text,
                    marginBottom: getScaledFontSize(4),
                  }
                ]}>
                  {subCategory.name}
                </Text>
                <Text style={[
                  styles.listItemRole,
                  {
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(400) as any,
                    color: colors.text + '80',
                  }
                ]}>
                  {providerCount} {providerCount === 1 ? 'provider' : 'providers'}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={getScaledFontSize(20)} color={colors.text + '60'} />
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  const renderProviders = () => {
    const providers = getCurrentProviders();
    const category = selectedCategoryId ? getCategoryById(selectedCategoryId) : undefined;
    const subCategory = selectedCategoryId && selectedSubCategoryId 
      ? getSubCategoryById(selectedCategoryId, selectedSubCategoryId) 
      : undefined;

    return (
      <>
        <View style={[
          styles.detailsListHeader,
          {
            borderBottomColor: colors.text + '20',
            paddingHorizontal: getScaledFontSize(16),
            paddingVertical: getScaledFontSize(12),
            marginBottom: getScaledFontSize(8),
          }
        ]}>
          <TouchableOpacity onPress={handleBack} style={{ padding: getScaledFontSize(4) }}>
            <IconSymbol name="chevron.right" size={getScaledFontSize(24)} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[
            styles.detailsListTitle,
            {
              fontSize: getScaledFontSize(18),
              fontWeight: getScaledFontWeight(600) as any,
              color: colors.text,
              flex: 1,
              marginLeft: getScaledFontSize(8),
            }
          ]}>
            {subCategory?.name || category?.name || 'Providers'}
          </Text>
        </View>
        {isLoadingProviders ? (
          <View style={[styles.listItem, { paddingVertical: getScaledFontSize(16), paddingHorizontal: getScaledFontSize(16) }]}>
            <Text style={[
              {
                fontSize: getScaledFontSize(14),
                color: colors.text + '80',
              }
            ]}>Loading providers...</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={[styles.listItem, { paddingVertical: getScaledFontSize(16), paddingHorizontal: getScaledFontSize(16) }]}>
            <Text style={[
              {
                fontSize: getScaledFontSize(14),
                color: colors.text + '80',
              }
            ]}>No providers found</Text>
          </View>
        ) : (
          providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.listItem,
                {
                  borderBottomColor: colors.text + '20',
                  paddingVertical: getScaledFontSize(16),
                  paddingHorizontal: getScaledFontSize(16),
                }
              ]}
              onPress={() => {
                router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
              }}
              activeOpacity={0.7}
            >
              <InitialsAvatar 
                name={provider.name}
                size={getScaledFontSize(56)} 
                style={styles.listAvatar} 
              />
              <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
                <Text style={[
                  styles.listItemName,
                  {
                    fontSize: getScaledFontSize(16),
                    fontWeight: getScaledFontWeight(600) as any,
                    color: colors.text,
                    marginBottom: getScaledFontSize(4),
                  }
                ]}>
                  {provider.name}
                </Text>
                <Text style={[
                  styles.listItemRole,
                  {
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(400) as any,
                    color: colors.text + '80',
                  }
                ]}>
                  {provider.qualifications || provider.specialty || 'Healthcare Provider'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </>
    );
  };

  return (
    <View style={styles.listContainer}>
      <ScrollView
        style={[
          styles.listScrollView,
          {
            maxHeight: maxListHeight,
            borderWidth: 1,
            borderColor: colors.text + '15',
            borderRadius: getScaledFontSize(12),
          }
        ]}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {currentLevel === 'categories' && renderCategories()}
        {currentLevel === 'sub-categories' && renderSubCategories()}
        {currentLevel === 'providers' && renderProviders()}
      </ScrollView>
    </View>
  );
}

// Provider Details List Component (replaces main list)
interface ProviderDetailsListProps {
  colors: any;
  getScaledFontSize: (size: number) => number;
  getScaledFontWeight: (weight: number) => string | number;
  onBack: () => void;
  departmentId?: string;
  departmentName?: string;
}

function ProviderDetailsList({ colors, getScaledFontSize, getScaledFontWeight, onBack, departmentId, departmentName }: ProviderDetailsListProps) {
  // Calculate max height to push appointments to bottom of screen
  const screenHeight = Dimensions.get('window').height;
  const maxListHeight = Math.min(screenHeight * 0.65, 600);
  
  const [fastenProviders, setFastenProviders] = useState<FastenProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  
  // Load Fasten Health providers
  React.useEffect(() => {
    const loadProviders = async () => {
      setIsLoadingProviders(true);
      try {
        if (departmentId) {
          // Load providers by department
          const departments = await getFastenPractitionersByDepartment();
          const department = departments.find(d => d.id === departmentId);
          if (department) {
            setFastenProviders(department.doctors);
            console.log(`Loaded ${department.doctors.length} providers from department ${department.name}`);
          } else {
            setFastenProviders([]);
          }
        } else {
          // Load all providers
          const providers = await getFastenPractitioners();
          setFastenProviders(providers);
          console.log(`Loaded ${providers.length} providers from Fasten Health`);
        }
      } catch (error) {
        console.error('Error loading Fasten Health providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    
    loadProviders();
  }, [departmentId]);

  // Flatten all doctors from all departments into a single list
  const allProviders = React.useMemo(() => {
    // Use Fasten Health providers if available, otherwise use default
    if (fastenProviders.length > 0) {
      return fastenProviders.map(provider => ({
        id: provider.id,
        name: provider.name,
        qualifications: provider.qualifications || 'Healthcare Provider',
        specialty: provider.specialty || 'General',
        image: require('@/assets/images/dummy.jpg'), // Use default image
      }));
    }
    
    // Fallback to default departments
    const providers: Array<{ id: string; name: string; qualifications: string; image: any }> = [];
    if (departmentId) {
      // Filter by department if specified
      const dept = defaultDepartments.find(d => d.id === departmentId);
      if (dept) {
        dept.doctors.forEach((doc) => {
          providers.push(doc);
        });
      }
    } else {
      // Show all providers from all departments
      defaultDepartments.forEach((dept) => {
        dept.doctors.forEach((doc) => {
          providers.push(doc);
        });
      });
    }
    return providers;
  }, [fastenProviders, departmentId]);

  return (
    <View style={styles.listContainer}>
      <View style={[
        styles.detailsListHeader,
        {
          borderBottomColor: colors.text + '20',
          paddingHorizontal: getScaledFontSize(16),
          paddingVertical: getScaledFontSize(12),
          marginBottom: getScaledFontSize(8),
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={{ padding: getScaledFontSize(4) }}>
          <IconSymbol name="chevron.right" size={getScaledFontSize(24)} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={[
          styles.detailsListTitle,
          {
            fontSize: getScaledFontSize(18),
            fontWeight: getScaledFontWeight(600) as any,
            color: colors.text,
            flex: 1,
            marginLeft: getScaledFontSize(8),
          }
        ]}>
          {departmentName || 'All Providers'}
        </Text>
      </View>
      <ScrollView
        style={[
          styles.listScrollView,
          {
            maxHeight: maxListHeight,
            borderWidth: 1,
            borderColor: colors.text + '15',
            borderRadius: getScaledFontSize(12),
          }
        ]}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {allProviders.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[
              styles.listItem,
              {
                borderBottomColor: colors.text + '20',
                paddingVertical: getScaledFontSize(16),
                paddingHorizontal: getScaledFontSize(16),
              }
            ]}
            onPress={() => {
              const specialty = (doc as any).specialty || '';
              router.push(`/(doctor-detail)?id=${encodeURIComponent(doc.id)}&name=${encodeURIComponent(doc.name)}&qualifications=${encodeURIComponent(doc.qualifications || '')}&specialty=${encodeURIComponent(specialty)}`);
            }}
            activeOpacity={0.7}
          >
            <InitialsAvatar 
              name={doc.name}
              size={getScaledFontSize(56)} 
              style={styles.listAvatar} 
            />
            <View style={[styles.listItemContent, { marginLeft: getScaledFontSize(16) }]}>
              <Text style={[
                styles.listItemName,
                {
                  fontSize: getScaledFontSize(16),
                  fontWeight: getScaledFontWeight(600) as any,
                  color: colors.text,
                  marginBottom: getScaledFontSize(4),
                }
              ]}>
                {doc.name}
              </Text>
              <Text style={[
                styles.listItemRole,
                {
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(400) as any,
                  color: colors.text + '80',
                }
              ]}>
                {doc.qualifications}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const { getScaledFontSize, settings, getScaledFontWeight } = useAccessibility();
  const userImg = require('@/assets/images/dummy.jpg');
  const isTabletDevice = isTablet();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const [viewMode, setViewMode] = React.useState<'circle' | 'list' | 'circle-providers'>('circle');
  
  // Load Fasten Health providers for circle view
  const [fastenProviders, setFastenProviders] = useState<FastenProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [patientName, setPatientName] = useState('Jenny Wilson');
  
  // Helper function to get first name from full name
  const getFirstName = (fullName: string): string => {
    if (!fullName) return 'Jenny';
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || 'Jenny';
  };
  
  useEffect(() => {
    const loadProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const providers = await getFastenPractitioners();
        setFastenProviders(providers);
        console.log(`Loaded ${providers.length} providers from Fasten Health for home screen`);
      } catch (error) {
        console.error('Error loading Fasten Health providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    
    const loadPatient = async () => {
      try {
        const patient = await getFastenPatient();
        if (patient) {
          setPatientName(patient.name || 'Jenny Wilson');
          console.log('Loaded patient name for home screen:', patient.name);
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    };
    
    loadProviders();
    loadPatient();
  }, []);
  
  // Generate doctors for circle view - use Fasten Health providers if available
  const doctors = React.useMemo(() => {
    if (fastenProviders.length > 0) {
      // Use Fasten Health providers, limit to 8 for circle view
      const providerCount = Math.min(fastenProviders.length, 8);
      const providerDoctors: Doctor[] = [];
      
      // Always add 1 care manager
      providerDoctors.push({ key: 0, role: 'care_manager' });
      
      // Add providers
      for (let i = 1; i < providerCount; i++) {
        providerDoctors.push({ 
          key: i, 
          role: i % 2 === 0 ? 'provider' : 'doctor_on_demand' 
        });
      }
      
      // Shuffle to randomize care manager position
      for (let i = providerDoctors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [providerDoctors[i], providerDoctors[j]] = [providerDoctors[j], providerDoctors[i]];
      }
      
      return providerDoctors;
    }
    
    // Fallback to generated doctors
    return generateDoctors(isTabletDevice);
  }, [fastenProviders, isTabletDevice]);
  
  // Cycle through views: circle -> circle-providers -> list -> circle
  const toggleViewMode = () => {
    if (viewMode === 'circle') {
      setViewMode('circle-providers');
    } else if (viewMode === 'circle-providers') {
      setViewMode('list');
    } else {
      setViewMode('circle');
    }
  };
  
  // Get icon based on current view (shows what you'll switch to)
  const getToggleIcon = () => {
    if (viewMode === 'circle') {
      return 'person.fill'; // Will switch to circle-providers
    } else if (viewMode === 'circle-providers') {
      return 'list.bullet'; // Will switch to list
    } else {
      return 'circle.fill'; // Will switch back to circle
    }
  };
  const [showProviderDetails, setShowProviderDetails] = React.useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | undefined>(undefined);
  const [selectedDepartmentName, setSelectedDepartmentName] = React.useState<string | undefined>(undefined);
  
  // Animation values for sliding between main list and details list
  const screenWidth = Dimensions.get('window').width;
  const mainListSlide = React.useRef(new Animated.Value(0)).current;
  const detailsListSlide = React.useRef(new Animated.Value(screenWidth)).current;
  const mainListOpacity = React.useRef(new Animated.Value(1)).current;
  const detailsListOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showProviderDetails) {
      // Slide in details list from right, slide out main list to left
      Animated.parallel([
        Animated.timing(mainListSlide, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsListSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainListOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsListOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide back to main list
      Animated.parallel([
        Animated.timing(mainListSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsListSlide, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainListOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsListOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showProviderDetails, screenWidth]);

  return (
    <AppWrapper notificationCount={3}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.circleSection}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.sectionTitle, 
              { 
                fontSize: getScaledFontSize(24), 
                fontWeight: getScaledFontWeight(600) as any, 
                color: colors.text,
                paddingBottom: 50,
                flex: 1,
              }
            ]}>
              {getFirstName(patientName)}'s Circle of Support
            </Text>
            <TouchableOpacity
              onPress={toggleViewMode}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: colors.text + '10',
                  padding: getScaledFontSize(10),
                  borderRadius: getScaledFontSize(8),
                  marginBottom: 50,
                }
              ]}
              activeOpacity={0.7}
            >
              <IconSymbol 
                name={getToggleIcon()} 
                size={getScaledFontSize(24)} 
                color={colors.tint || '#008080'} 
              />
            </TouchableOpacity>
          </View>
          {viewMode === 'circle' ? (
            isTabletDevice ? (
              <TabletCircleView 
                doctors={doctors}
                userImg={userImg}
                colors={colors}
                getScaledFontSize={getScaledFontSize}
                getScaledFontWeight={getScaledFontWeight}
                fastenProviders={fastenProviders}
                patientName={patientName}
              />
            ) : (
              <PhoneCircleView 
                doctors={doctors}
                userImg={userImg}
                colors={colors}
                getScaledFontSize={getScaledFontSize}
                getScaledFontWeight={getScaledFontWeight}
                fastenProviders={fastenProviders}
                patientName={patientName}
              />
            )
          ) : viewMode === 'list' ? (
            <View style={styles.listViewContainer}>
              <Animated.View
                style={[
                  styles.listViewWrapper,
                  {
                    opacity: mainListOpacity,
                    transform: [{ translateX: mainListSlide }],
                  }
                ]}
                pointerEvents={showProviderDetails ? 'none' : 'auto'}
              >
                <ListView
                  doctors={doctors}
                  userImg={userImg}
                  colors={colors}
                  getScaledFontSize={getScaledFontSize}
                  getScaledFontWeight={getScaledFontWeight}
                  onItemPress={(categoryId, subCategoryId) => {
                    // ListView now handles navigation internally
                    // This callback is called when a sub-category is selected
                    console.log(`Selected category: ${categoryId}, sub-category: ${subCategoryId}`);
                  }}
                  fastenProviders={fastenProviders}
                  patientName={patientName}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.listViewWrapper,
                  styles.detailsListWrapper,
                  {
                    opacity: detailsListOpacity,
                    transform: [{ translateX: detailsListSlide }],
                  }
                ]}
                pointerEvents={showProviderDetails ? 'auto' : 'none'}
              >
                <ProviderDetailsList
                  colors={colors}
                  getScaledFontSize={getScaledFontSize}
                  getScaledFontWeight={getScaledFontWeight}
                  onBack={() => {
                    setShowProviderDetails(false);
                    setSelectedDepartmentId(undefined);
                    setSelectedDepartmentName(undefined);
                  }}
                  departmentId={selectedDepartmentId}
                  departmentName={selectedDepartmentName}
                />
              </Animated.View>
            </View>
          ) : (
            <CircleProvidersListView
              doctors={doctors}
              userImg={userImg}
              colors={colors}
              getScaledFontSize={getScaledFontSize}
              getScaledFontWeight={getScaledFontWeight}
              fastenProviders={fastenProviders}
              patientName={patientName}
            />
          )}
        </View>
        
        <View style={styles.appointmentsSection}>
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: getScaledFontSize(18),
              fontWeight: getScaledFontWeight(600) as any,
              color: colors.text,
            }
          ]}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/appointments-modal')} style={[
            styles.deckContainer,
            {
              height: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
            }
          ]}>
            {/* First card */}
            <Card style={[
              styles.appointmentCard,
              styles.firstCard,
              {
                height: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
              }
            ]}>
              <View style={[
                styles.listItemContainer,
                {
                  paddingHorizontal: getScaledFontSize(16),
                  paddingVertical: getScaledFontSize(8),
                  minHeight: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
                }
              ]}>
                <View style={{ transform: [{ scale: getScaledFontSize(24) / 24 }] }}>
                  <List.Icon icon="calendar-clock" />
                </View>
                <View style={[
                  styles.listItemContent,
                  {
                    marginLeft: getScaledFontSize(16),
                    flexShrink: 1,
                  }
                ]}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500',
                      marginBottom: getScaledFontSize(2),
                    }
                  ]}>Therapy Session</Text>
                  <Text style={[
                    styles.appointmentDescription,
                    {
                      fontSize: getScaledFontSize(14),
                      fontWeight: settings.isBoldTextEnabled ? '600' : '400'
                    }
                  ]}>Mon, Nov 20 · 10:00 AM</Text>
                </View>
              </View>
            </Card>

            {/* Second card (stacked behind) */}
            <Card style={[
              styles.appointmentCard,
              styles.secondCard,
              {
                height: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
              }
            ]}>
              <View style={[
                styles.listItemContainer,
                {
                  paddingHorizontal: getScaledFontSize(16),
                  paddingVertical: getScaledFontSize(8),
                  minHeight: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
                }
              ]}>
                <View style={{ transform: [{ scale: getScaledFontSize(24) / 24 }] }}>
                  <List.Icon icon="stethoscope" />
                </View>
                <View style={[
                  styles.listItemContent,
                  {
                    marginLeft: getScaledFontSize(16),
                    flexShrink: 1,
                  }
                ]}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500',
                      marginBottom: getScaledFontSize(2),
                    }
                  ]}>Annual Check-up</Text>
                  <Text style={[
                    styles.appointmentDescription,
                    {
                      fontSize: getScaledFontSize(14),
                      fontWeight: settings.isBoldTextEnabled ? '600' : '400'
                    }
                  ]}>Wed, Nov 22 · 2:00 PM</Text>
                </View>
              </View>
            </Card>

            {/* Third card (stacked behind) */}
            <Card style={[
              styles.appointmentCard,
              styles.thirdCard,
              {
                height: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
              }
            ]}>
              <View style={[
                styles.listItemContainer,
                {
                  paddingHorizontal: getScaledFontSize(16),
                  paddingVertical: getScaledFontSize(8),
                  minHeight: Math.max(56, getScaledFontSize(16) + getScaledFontSize(2) + getScaledFontSize(14) + (getScaledFontSize(8) * 2) + getScaledFontSize(4)),
                }
              ]}>
                <View style={{ transform: [{ scale: getScaledFontSize(24) / 24 }] }}>
                  <List.Icon icon="tooth" />
                </View>
                <View style={[
                  styles.listItemContent,
                  {
                    marginLeft: getScaledFontSize(16),
                    flexShrink: 1,
                  }
                ]}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500',
                      marginBottom: getScaledFontSize(2),
                    }
                  ]}>Dental Cleaning</Text>
                  <Text style={[
                    styles.appointmentDescription,
                    {
                      fontSize: getScaledFontSize(14),
                      fontWeight: settings.isBoldTextEnabled ? '600' : '400'
                    }
                  ]}>Fri, Nov 24 · 11:30 AM</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  circleSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  headerLogo: {
    width: 120,
    height: 60,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
  },
  circleContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitAvatar: {
    position: 'absolute',
    width: 56,
    height: 80,
  },
  avatarWithBorder: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  centerBadge: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
  },
  centerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreDoctorsButton: {
    alignSelf: 'center',
  },
  moreButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingTop: 20,
  },
  appointmentsSection: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  deckContainer: {
    position: 'relative',
    height: 56,
  },
  appointmentCard: {
    borderRadius: 16,
    position: 'absolute',
    width: '100%',
    height: 56,
  },
  firstCard: {
    zIndex: 3,
    top: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondCard: {
    zIndex: 2,
    top: 8,
    left: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  thirdCard: {
    zIndex: 1,
    top: 16,
    left: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  linkLine: {
    position: 'absolute',
    height: 2,
    top: '50%',
    left: '50%',
    marginLeft: 0,
    marginTop: -1,
    borderRadius: 1,
  },
  centerAvatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centerAvatarImage: {
    // backgroundColor removed - let InitialsAvatar handle it
  },
  centerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  orbitAvatarText: {
    marginTop: 4,
    textAlign: 'center',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 56,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  appointmentDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
  },
  toggleButton: {
    // Styles applied inline
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  listScrollView: {
    width: '100%',
  },
  listScrollContent: {
    paddingBottom: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    width: '100%',
  },
  listAvatar: {
    backgroundColor: 'transparent',
  },
  listItemName: {
    // Styles applied inline
  },
  listItemRole: {
    // Styles applied inline
  },
  listViewContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  listViewWrapper: {
    width: '100%',
  },
  detailsListWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  detailsListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  detailsListTitle: {
    // Styles applied inline
  },
  categorySection: {
    width: '100%',
  },
  categoryHeader: {
    // Styles applied inline
  },
});

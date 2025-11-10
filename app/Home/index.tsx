import { AppWrapper } from '@/components/app-wrapper';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, List } from 'react-native-paper';

// Helper function to detect if device is a tablet
const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768; // iPad starts at 768px width
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
}

// Original Circle View for iPhone/Android (fixed dimensions)
function PhoneCircleView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight }: CircleViewProps) {
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
          borderColor: '#e0e0e0',
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
          <Avatar.Image source={userImg} size={getScaledFontSize(centerAvatarSize)} style={styles.centerAvatarImage} />
        </TouchableOpacity>
        <Text style={[
          styles.centerAvatarText,
          {
            fontSize: getScaledFontSize(16),
            fontWeight: getScaledFontWeight(600) as any,
            color: colors.text,
          }
        ]}>Jenny Wilson</Text>
      </View>
      <Button mode="contained" onPress={() => router.push('/modal')} style={styles.moreDoctorsButton}>
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
              onPress={() => router.push('/(doctor-detail)?name=Dr. Max K.')}
            >
              <Avatar.Image
                size={getScaledFontSize(avatarSize)}
                source={userImg} />
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
                Kendrick L.
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// Responsive Circle View for iPad/Tablet
function TabletCircleView({ doctors, userImg, colors, getScaledFontSize, getScaledFontWeight }: CircleViewProps) {
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
          borderWidth: 2,
          borderColor: '#e0e0e0',
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
          <Avatar.Image source={userImg} size={getScaledFontSize(centerAvatarSize)} style={styles.centerAvatarImage} />
        </TouchableOpacity>
        <Text style={[
          styles.centerAvatarText,
          {
            fontSize: getScaledFontSize(16 * Math.min(scaleFactor, 1.5)),
            fontWeight: getScaledFontWeight(600) as any,
            color: colors.text,
          }
        ]}>Jenny Wilson</Text>
      </View>
      <Button mode="contained" onPress={() => router.push('/modal')} style={styles.moreDoctorsButton}>
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
              onPress={() => router.push('/(doctor-detail)?name=Dr. Max K.')}
            >
              <Avatar.Image
                size={getScaledFontSize(avatarSize)}
                source={userImg} />
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
                Kendrick L.
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

export default function HomeScreen() {
  const { getScaledFontSize, settings, getScaledFontWeight } = useAccessibility();
  const userImg = require('@/assets/images/dummy.jpg');
  const isTabletDevice = isTablet();
  const doctors = React.useMemo(() => generateDoctors(isTabletDevice), [isTabletDevice]);
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  return (
    <AppWrapper notificationCount={3}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.circleSection}>
          <Text style={[
            styles.sectionTitle, 
            { 
              fontSize: getScaledFontSize(24), 
              fontWeight: getScaledFontWeight(600) as any, 
              color: colors.text,
              paddingBottom: 50
            }
          ]}>
            Jenny's Circle of Support
          </Text>
          {isTabletDevice ? (
            <TabletCircleView 
              doctors={doctors}
              userImg={userImg}
              colors={colors}
              getScaledFontSize={getScaledFontSize}
              getScaledFontWeight={getScaledFontWeight}
            />
          ) : (
            <PhoneCircleView 
              doctors={doctors}
              userImg={userImg}
              colors={colors}
              getScaledFontSize={getScaledFontSize}
              getScaledFontWeight={getScaledFontWeight}
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
          <TouchableOpacity onPress={() => router.push('/appointments-modal')} style={styles.deckContainer}>
            {/* First card */}
            <Card style={[styles.appointmentCard, styles.firstCard]}>
              <View style={styles.listItemContainer}>
                <List.Icon icon="calendar-clock" />
                <View style={styles.listItemContent}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500'
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
            <Card style={[styles.appointmentCard, styles.secondCard]}>
              <View style={styles.listItemContainer}>
                <List.Icon icon="stethoscope" />
                <View style={styles.listItemContent}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500'
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
            <Card style={[styles.appointmentCard, styles.thirdCard]}>
              <View style={styles.listItemContainer}>
                <List.Icon icon="tooth" />
                <View style={styles.listItemContent}>
                  <Text style={[
                    styles.appointmentTitle,
                    {
                      fontSize: getScaledFontSize(16),
                      fontWeight: settings.isBoldTextEnabled ? '700' : '500'
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
    backgroundColor: 'white',
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
});

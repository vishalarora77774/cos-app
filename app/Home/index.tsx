import { AppWrapper } from '@/components/app-wrapper';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, List } from 'react-native-paper';

export default function HomeScreen() {
  const { getScaledFontSize, settings, getScaledFontWeight } = useAccessibility();
  const userImg = require('@/assets/images/dummy.jpg');
  const doctors = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ key: i }));
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
          <View style={[styles.circleContainer, { width: 384, height: 320, alignItems: 'center', justifyContent: 'center' }]}>
            <Image
              source={require('@/assets/images/backgroud.png')}
              style={styles.background}
              contentFit='contain' />
            {/* Circular line connecting the orbiting avatars */}
            <View
              style={{
                position: 'absolute',
                width: 316.8, // diameter = 2 * radius (radius is 144 * 1.1 = 158.4)
                height: 316.8,
                borderRadius: 158.4,
                borderWidth: 2,
                borderColor: '#e0e0e0',
                borderStyle: 'dashed',
                left: (384 - 316.8) / 2,
                top: (320 - 316.8) / 2,
                zIndex: 0,
              }} />
            <View style={styles.centerAvatarWrapper}>
              <TouchableOpacity 
                onPress={() => router.push('/Home/today-schedule')}
                activeOpacity={0.8}
              >
                <Avatar.Image source={userImg} size={getScaledFontSize(80)} style={styles.centerAvatarImage} />
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
              const radius = 144 * 1.1;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              // Determine if this avatar is at an edge position (right, top, left, or bottom)
              const isAtEdge = idx === 0 || idx === 2 || idx === 4 || idx === 6;
              return (
                <React.Fragment key={`doctor-${u.key}`}>
                  <View
                    style={[
                      styles.linkLine,
                      {
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
                        left: 384 / 2 + x - 60, // 60 = half of expanded width (120)
                        top: 320 / 2 + y - 60, // 60 = half of expanded height (120)
                        zIndex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120, // Further expanded width to prevent text wrapping
                        height: 120, // Further expanded height for better spacing
                      },
                    ]}
                    onPress={() => router.push('/(doctor-detail)?name=Dr. Max K.')}
                  >
                    <Avatar.Image
                      size={getScaledFontSize(48)}
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
    width: 92,
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

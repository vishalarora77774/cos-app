import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Icon, List } from 'react-native-paper';

export default function ProfileScreen() {
  const userImg = require('@/assets/images/dummy.jpg');
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];

  return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar.Image source={userImg} size={80} style={styles.avatar} />
          <Text style={[styles.name, { color: colors.text, fontSize: getScaledFontSize(24), fontWeight: getScaledFontWeight(600) as any }]}>Jenny Wilson</Text>
          <Text style={[{ color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>jenny.wilson@email.com</Text>
        </View>

        <View style={styles.menuSection}>
          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Personal Information</Text>}
              description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Update your profile details</Text>}
              left={(props) => <Icon {...props} source="account" size={getScaledFontSize(40)} />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => router.push('/(personal-info)')}
            />
          </Card>

          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Medical History</Text>}
              description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>View and manage your records</Text>}
              left={(props) => <Icon {...props} source="medical-bag" size={getScaledFontSize(40)} />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => {}}
            />
          </Card>

          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Insurance Information</Text>}
              description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Manage your coverage details</Text>}
              left={(props) => <Icon {...props} source="card-account-details" size={getScaledFontSize(40)}  />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => {}}
            />
          </Card>

          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Emergency Contacts</Text>}
              description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Manage your emergency contacts</Text>}
              left={(props) => <Icon {...props} source="account-group" size={getScaledFontSize(40)} />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => {}}
            />
          </Card>

          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Notifications</Text>}
              description={<Text style={[{  fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Manage your notification preferences</Text>}
              left={(props) => <Icon {...props} source="bell" size={getScaledFontSize(40)} />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => {}}
            />
          </Card>

          <Card style={styles.menuCard}>
            <List.Item
              title={<Text style={[{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>Privacy & Security</Text>}
              description={<Text style={[{ fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>Manage your privacy settings</Text>}
              left={(props) => <Icon {...props} source="shield-account" size={getScaledFontSize(40)} />}
              right={(props) => <Icon {...props} source="chevron-right" size={getScaledFontSize(40)} />}
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Button 
            mode="outlined" 
            onPress={() => {}} 
            style={styles.signOutButton}
          >
            <Text style={[{ color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any, lineHeight: getScaledFontSize(24) }]}>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  menuSection: {
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 12,
    paddingLeft: 16,
  },
  footer: {
    marginTop: 0,
  },
  signOutButton: {
    borderColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});

import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, IconButton, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Task {
  id: number;
  time: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  completed: boolean;
}

export default function TodayScheduleScreen() {
  const { getScaledFontSize, settings, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const userImg = require('@/assets/images/dummy.jpg');

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      time: '09:00 AM',
      title: 'Morning Medication',
      description: 'Take prescribed vitamins and supplements',
      type: 'medication',
      icon: 'pill',
      completed: true,
    },
    {
      id: 2,
      time: '10:00 AM',
      title: 'Therapy Session',
      description: 'Video call with Dr. Sarah Johnson',
      type: 'appointment',
      icon: 'video',
      completed: false,
    },
    {
      id: 3,
      time: '02:00 PM',
      title: 'Check-in with Care Team',
      description: 'Review weekly progress report',
      type: 'check-in',
      icon: 'account-group',
      completed: false,
    },
    {
      id: 4,
      time: '06:00 PM',
      title: 'Evening Medication',
      description: 'Take prescribed medication',
      type: 'medication',
      icon: 'pill',
      completed: false,
    },
    {
      id: 5,
      time: '08:00 PM',
      title: 'Daily Reflection',
      description: 'Log mood and activity levels',
      type: 'self-care',
      icon: 'heart',
      completed: false,
    },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconButton icon="arrow-left" size={getScaledFontSize(24)} iconColor={colors.text} />
          </TouchableOpacity>
          <Text 
            numberOfLines={2}
            style={[
              styles.headerTitle,
              { 
                fontSize: getScaledFontSize(24), 
                fontWeight: getScaledFontWeight(700) as any, 
                color: colors.text,
              }
            ]}>
            Today's Schedule
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Summary */}
        <Card style={[styles.profileCard, { backgroundColor: colors.background }]}>
          <View style={styles.profileContent}>
            <Avatar.Image source={userImg} size={getScaledFontSize(80)} />
            <View style={styles.profileInfo}>
              <Text style={[
                styles.profileName,
                {
                  fontSize: getScaledFontSize(20),
                  fontWeight: getScaledFontWeight(600) as any,
                  color: colors.text,
                }
              ]}>
                Jenny Wilson
              </Text>
              <Text style={[
                styles.profileRole,
                {
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(400) as any,
                  color: colors.text + '80',
                }
              ]}>
                Patient
              </Text>
            </View>
          </View>
        </Card>

        {/* Progress Section */}
        <Card style={[styles.progressCard]}>
          <View style={styles.progressContent}>
            <Text style={[
              styles.progressTitle,
              {
                fontSize: getScaledFontSize(16),
                fontWeight: getScaledFontWeight(600) as any,
                marginBottom: 8,
              }
            ]}>
              Today's Progress
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.progressText,
                {
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                  marginTop: 4,
                }
              ]}>
                {completedCount} of {tasks.length} completed
              </Text>
            </View>
          </View>
        </Card>

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: getScaledFontSize(18),
              fontWeight: getScaledFontWeight(600) as any,
              color: colors.text,
            }
          ]}>
            Today's Tasks
          </Text>
          
          {tasks.map((task, index) => (
            <TouchableOpacity 
              key={task.id}
              onPress={() => toggleTaskCompletion(task.id)}
              activeOpacity={0.7}
            >
              <Card 
                style={[
                  styles.taskCard, 
                  { 
                    borderLeftWidth: 4,
                    borderLeftColor: '#0a7ea4'
                  }
                ]}
              >
                <View style={styles.taskContent}>
                <View style={styles.taskLeft}>
                  <List.Icon 
                    icon={task.icon} 
                    color={'#0a7ea4'}
                  />
                  <View style={styles.taskDetails}>
                    <Text style={[
                      styles.taskTime,
                      {
                        fontSize: getScaledFontSize(12),
                        fontWeight: getScaledFontWeight(500) as any,
                      }
                    ]}>
                      {task.time}
                    </Text>
                    <Text 
                      numberOfLines={2}
                      style={[
                        styles.taskTitle,
                        {
                          fontSize: getScaledFontSize(16),
                          fontWeight: task.completed 
                            ? settings.isBoldTextEnabled ? '700' : '600' 
                            : '600',
                          textDecorationLine: task.completed ? 'line-through' : 'none',
                        }
                      ]}>
                      {task.title}
                    </Text>
                    <Text 
                      numberOfLines={3}
                      style={[
                        styles.taskDescription,
                        {
                          fontSize: getScaledFontSize(14),
                          fontWeight: settings.isBoldTextEnabled ? '500' : '400',
                        }
                      ]}>
                      {task.description}
                    </Text>
                  </View>
                </View>
                {task.completed ? (
                  <IconButton 
                    icon="check-circle" 
                    iconColor={'#0a7ea4'} 
                    size={28}
                  />
                ) : (
                  <IconButton 
                    icon="circle-outline" 
                    iconColor={'#0a7ea4'}
                    size={28}
                  />
                )}
              </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    flexShrink: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  progressContent: {
    width: '100%',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0a7ea4'
  },
  progressText: {
    fontSize: 14,
    marginTop: 4,
  },
  tasksSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  taskCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskDetails: {
    marginLeft: 12,
    flex: 1,
  },
  taskTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
});


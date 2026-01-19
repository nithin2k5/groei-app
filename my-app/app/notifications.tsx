import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const notifications = [
  {
    id: 1,
    type: 'application',
    title: 'Application Update',
    message: 'Your application for Senior React Developer at Tech Corp has been reviewed',
    time: '2 hours ago',
    read: false,
    icon: 'briefcase',
  },
  {
    id: 2,
    type: 'match',
    title: 'New Job Match',
    message: 'We found 3 new jobs that match your profile',
    time: '5 hours ago',
    read: false,
    icon: 'star',
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from a recruiter',
    time: '1 day ago',
    read: true,
    icon: 'mail',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationsList, setNotificationsList] = useState(notifications);

  const markAsRead = (id: number) => {
    setNotificationsList(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notificationsList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          notificationsList.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
              onPress={() => {
                markAsRead(notification.id);
                if (notification.type === 'application') {
                  router.push('/applications');
                }
              }}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name={notification.icon as any} size={24} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingVertical: isSmallScreen ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  notificationCardUnread: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1.5,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});

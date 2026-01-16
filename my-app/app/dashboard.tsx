import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.75;

export default function DashboardScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  const { signOut, isSignedIn } = useAuth();

  const menuItems = [
    { id: 'home', icon: 'home-outline', label: 'Dashboard', activeIcon: 'home' },
    { id: 'jobs', icon: 'briefcase-outline', label: 'Jobs', activeIcon: 'briefcase' },
    { id: 'projects', icon: 'folder-outline', label: 'Projects', activeIcon: 'folder' },
    { id: 'profile', icon: 'person-outline', label: 'Profile', activeIcon: 'person' },
    { id: 'settings', icon: 'settings-outline', label: 'Settings', activeIcon: 'settings' },
  ];

  const handleMenuPress = (itemId: string) => {
    setActiveTab(itemId);
    setDrawerOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    router.replace('/(tabs)');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>Here's what's happening with your job search</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="briefcase" size={32} color="#041F2B" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Active Applications</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={32} color="#041F2B" />
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Interviews</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Jobs</Text>
              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobIconContainer}>
                    <Ionicons name="code" size={24} color="#041F2B" />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>Senior React Developer</Text>
                    <Text style={styles.jobCompany}>Tech Corp Inc.</Text>
                  </View>
                  <Ionicons name="bookmark-outline" size={24} color="#4a5568" />
                </View>
                <Text style={styles.jobDescription}>
                  Full-time remote position. 5+ years experience required. React, TypeScript, Node.js
                </Text>
                <View style={styles.jobFooter}>
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>Remote</Text>
                  </View>
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>$80k - $120k</Text>
                  </View>
                  <Text style={styles.matchText}>95% Match</Text>
                </View>
              </View>

              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobIconContainer}>
                    <Ionicons name="server" size={24} color="#041F2B" />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>Backend Engineer</Text>
                    <Text style={styles.jobCompany}>StartupXYZ</Text>
                  </View>
                  <Ionicons name="bookmark-outline" size={24} color="#4a5568" />
                </View>
                <Text style={styles.jobDescription}>
                  Full-time hybrid position. Node.js, Python, AWS experience preferred
                </Text>
                <View style={styles.jobFooter}>
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>Hybrid</Text>
                  </View>
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>$70k - $100k</Text>
                  </View>
                  <Text style={styles.matchText}>92% Match</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'jobs':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>All Jobs</Text>
            <Text style={styles.emptyText}>No jobs available at the moment</Text>
          </View>
        );
      case 'projects':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <Text style={styles.emptyText}>No projects available at the moment</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text style={styles.emptyText}>Profile details coming soon</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Text style={styles.emptyText}>Settings coming soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerOpen(!drawerOpen)}
          >
            <Ionicons name="menu" size={28} color="#041F2B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="briefcase" size={22} color="#041F2B" />
            </View>
            <Text style={styles.logoText}>GROEI</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#041F2B" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>

      {drawerOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoContainer}>
                <Ionicons name="briefcase" size={28} color="#041F2B" />
              </View>
              <Text style={styles.drawerLogoText}>GROEI</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDrawerOpen(false)}
              >
                <Ionicons name="close" size={24} color="#041F2B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerContent}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    activeTab === item.id && styles.menuItemActive,
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <Ionicons
                    name={activeTab === item.id ? item.activeIcon : item.icon}
                    size={24}
                    color={activeTab === item.id ? '#041F2B' : '#4a5568'}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      activeTab === item.id && styles.menuItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#ffffff" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 0,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#041F2B',
    letterSpacing: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#041F2B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#041F2B',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#041F2B',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#041F2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#041F2B',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  jobDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jobTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#041F2B',
  },
  matchText: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '700',
    color: '#041F2B',
  },
  emptyText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 40,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    zIndex: 999,
    shadowColor: '#041F2B',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#041F2B',
    letterSpacing: 2,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginLeft: 16,
  },
  menuItemTextActive: {
    color: '#041F2B',
    fontWeight: '700',
  },
  drawerFooter: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#041F2B',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

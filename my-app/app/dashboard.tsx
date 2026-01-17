import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, TextInput, Pressable, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';
import { jobsApi, savedJobsApi, applicationsApi, interviewsApi, authApi, resumesApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.75;
const isSmallScreen = screenWidth < 375;

export default function DashboardScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, saved: 0 });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeResume, setActiveResume] = useState<any>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsRes, savedRes, appsRes, interviewsRes, profileRes, resumesRes] = await Promise.all([
        jobsApi.getAll({}),
        savedJobsApi.getAll(),
        applicationsApi.getAll(),
        interviewsApi.getAll(),
        authApi.getProfile(),
        resumesApi.getAll(),
      ]);

      setUserProfile(profileRes);

      const allResumes = Array.isArray(resumesRes) ? resumesRes : [];
      const active = allResumes.find((r: any) => r.is_active);
      setActiveResume(active);

      const allJobs = Array.isArray(jobsRes) ? jobsRes : (jobsRes.data || jobsRes.jobs || []);
      setJobs(allJobs.slice(0, 4));
      setProjects([]);

      const savedJobIds = Array.isArray(savedRes)
        ? savedRes.map((item: any) => item.job_id || item.id)
        : (savedRes.data || []).map((item: any) => item.job_id || item.id);
      setSavedJobs(savedJobIds);

      const applications = Array.isArray(appsRes) ? appsRes : (appsRes.data || []);
      const interviews = Array.isArray(interviewsRes) ? interviewsRes : (interviewsRes.data || []);

      setStats({
        applications: applications.length,
        interviews: interviews.filter((i: any) => i.status === 'scheduled').length,
        saved: savedJobIds.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      const isSaved = savedJobs.includes(jobId);

      if (isSaved) {
        await savedJobsApi.delete(jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        setStats({ ...stats, saved: stats.saved - 1 });
      } else {
        await savedJobsApi.save(jobId);
        setSavedJobs([...savedJobs, jobId]);
        setStats({ ...stats, saved: stats.saved + 1 });
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const getJobIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('react') || lowerTitle.includes('frontend')) return 'code';
    if (lowerTitle.includes('backend') || lowerTitle.includes('server')) return 'server';
    if (lowerTitle.includes('design') || lowerTitle.includes('ui/ux')) return 'color-palette';
    if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) return 'layers';
    return 'briefcase';
  };

  const menuItems = [
    { id: 'home', icon: 'home-outline', label: 'Dashboard', activeIcon: 'home', route: null },
    { id: 'suggestions', icon: 'sparkles-outline', label: 'Suggestions', activeIcon: 'sparkles', route: '/suggestions' },
    { id: 'jobs', icon: 'briefcase-outline', label: 'Jobs', activeIcon: 'briefcase', route: '/jobs' },
    { id: 'companies', icon: 'business-outline', label: 'Companies', activeIcon: 'business', route: '/companies' },
    { id: 'projects', icon: 'folder-outline', label: 'Projects', activeIcon: 'folder', route: '/projects' },
    { id: 'saved', icon: 'bookmark-outline', label: 'Saved Jobs', activeIcon: 'bookmark', route: '/saved-jobs' },
    { id: 'applications', icon: 'document-text-outline', label: 'Applications', activeIcon: 'document-text', route: '/applications' },
    { id: 'interviews', icon: 'videocam-outline', label: 'Interviews', activeIcon: 'videocam', route: '/interviews' },
    { id: 'profile', icon: 'person-outline', label: 'Profile', activeIcon: 'person', route: null },
    { id: 'settings', icon: 'settings-outline', label: 'Settings', activeIcon: 'settings', route: null },
  ];


  const handleMenuPress = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    if (item?.route) {
      setDrawerOpen(false);
      setTimeout(() => {
        router.push(item.route as any);
      }, 100);
    } else {
      setActiveTab(itemId);
      setDrawerOpen(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace('/(tabs)');
  };

  const renderHomeContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtitle}>Here's what's happening with your job search</Text>
      </View>

      <View style={styles.statsContainer}>
        <Pressable
          style={styles.statCard}
          onPress={() => router.push('/applications')}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="briefcase" size={isSmallScreen ? 22 : 24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.statNumber}>{stats.applications}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </Pressable>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={isSmallScreen ? 22 : 24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.statNumber}>{stats.interviews}</Text>
          <Text style={styles.statLabel}>Interviews</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="star" size={isSmallScreen ? 22 : 24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.statNumber}>{stats.saved}</Text>
          <Text style={styles.statLabel}>Saved Jobs</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Jobs</Text>
          <TouchableOpacity onPress={() => router.push('/jobs')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No jobs available</Text>
          </View>
        ) : (
          jobs.slice(0, 2).map((job) => (
            <Pressable
              key={job.id}
              style={styles.jobCard}
              onPress={() => {
                router.push({
                  pathname: '/job-detail',
                  params: {
                    id: job.id.toString(),
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    salary: job.salary || '',
                    match: job.match?.toString() || '0',
                    type: job.type || '',
                    posted: job.posted || '',
                    icon: job.icon || getJobIcon(job.title || ''),
                  },
                });
              }}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobIconContainer}>
                  <Ionicons name={getJobIcon(job.title || '') as any} size={24} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title || 'Job Title'}</Text>
                  <Text style={styles.jobCompany}>{job.company || 'Company'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleSaveJob(job.id)}>
                  <Ionicons
                    name={savedJobs.includes(job.id) ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={savedJobs.includes(job.id) ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.jobDescription}>
                {job.type || ''} • {job.location || ''} • {job.posted || ''}
              </Text>
              <View style={styles.jobFooter}>
                {job.location && (
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>{job.location}</Text>
                  </View>
                )}
                {job.salary && (
                  <View style={styles.jobTag}>
                    <Text style={styles.jobTagText}>{job.salary}</Text>
                  </View>
                )}
                {job.match && (
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{job.match}% Match</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );

  const renderJobsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#a0aec0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterChips}>
        <Pressable style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
        </Pressable>
        <Pressable style={styles.filterChip}>
          <Text style={styles.filterChipText}>Full-time</Text>
        </Pressable>
        <Pressable style={styles.filterChip}>
          <Text style={styles.filterChipText}>Remote</Text>
        </Pressable>
        <Pressable style={styles.filterChip}>
          <Text style={styles.filterChipText}>Contract</Text>
        </Pressable>
      </View>

      <View style={styles.jobsList}>
        {jobs.map((job) => (
          <Pressable
            key={job.id}
            style={styles.jobCard}
            onPress={() => {
              router.push({
                pathname: '/job-detail',
                params: {
                  id: job.id.toString(),
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  salary: job.salary,
                  match: job.match.toString(),
                  type: job.type,
                  posted: job.posted,
                  icon: job.icon,
                },
              });
            }}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobIconContainer}>
                <Ionicons name={job.icon as any} size={24} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>{job.company} • {job.location}</Text>
              </View>
              <TouchableOpacity onPress={() => handleSaveJob(job.id)}>
                <Ionicons
                  name={savedJobs.includes(job.id) ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={savedJobs.includes(job.id) ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.jobDescription}>
              {job.type} • Posted {job.posted}
            </Text>
            <View style={styles.jobFooter}>
              <View style={styles.jobTag}>
                <Text style={styles.jobTagText}>{job.location}</Text>
              </View>
              <View style={styles.jobTag}>
                <Text style={styles.jobTagText}>{job.salary}</Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{job.match}% Match</Text>
              </View>
            </View>
            <Pressable
              style={styles.applyButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: '/job-application',
                  params: {
                    jobId: job.id.toString(),
                    jobTitle: job.title,
                    company: job.company,
                  },
                });
              }}
            >
              <Text style={styles.applyButtonText}>APPLY NOW</Text>
            </Pressable>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderProjectsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Projects</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.addButtonText}>New Project</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.projectsList}>
        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectIconContainer}>
                <Ionicons name={project.icon as any} size={28} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectClient}>{project.client}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                project.status === 'Completed' && styles.statusBadgeCompleted,
                project.status === 'Active' && styles.statusBadgeActive,
              ]}>
                <Text style={[
                  styles.statusText,
                  project.status === 'Completed' && styles.statusTextCompleted,
                  project.status === 'Active' && styles.statusTextActive,
                ]}>
                  {project.status}
                </Text>
              </View>
            </View>
            <View style={styles.projectDetails}>
              <View style={styles.projectDetailItem}>
                <Ionicons name="cash-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.projectDetailText}>{project.budget}</Text>
              </View>
              <View style={styles.projectDetailItem}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.projectDetailText}>{project.deadline}</Text>
              </View>
            </View>
            <View style={styles.projectActions}>
              <Pressable
                style={styles.projectActionButton}
                onPress={() => router.push({
                  pathname: '/(projects)/project-detail' as any,
                  params: {
                    id: project.id.toString(),
                    title: project.title || '',
                    client: project.client || '',
                    budget: project.budget || '',
                    duration: project.deadline || '',
                    skills: 'React,Node.js',
                    match: '90',
                    status: project.status?.toLowerCase() || 'active',
                  },
                })}
              >
                <Ionicons name="eye-outline" size={18} color={COLORS.PRIMARY} />
                <Text style={styles.projectActionText}>View Details</Text>
              </Pressable>
              <Pressable style={styles.projectActionButton}>
                <Ionicons name="chatbubble-outline" size={18} color={COLORS.PRIMARY} />
                <Text style={styles.projectActionText}>Messages</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProfileContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={48} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
        <Text style={styles.profileEmail}>{userProfile?.email || 'email@example.com'}</Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Ionicons name="create-outline" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Personal Information</Text>
        <View style={styles.profileInfoCard}>
          <View style={styles.profileInfoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Full Name</Text>
              <Text style={styles.profileInfoValue}>{userProfile?.name || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.profileInfoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Phone</Text>
              <Text style={styles.profileInfoValue}>{userProfile?.phone || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.profileInfoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Location</Text>
              <Text style={styles.profileInfoValue}>{userProfile?.location || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Professional Details</Text>
        <View style={styles.profileInfoCard}>
          <View style={styles.profileInfoRow}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Current Position</Text>
              <Text style={styles.profileInfoValue}>{userProfile?.title || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.profileInfoRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Experience</Text>
              <Text style={styles.profileInfoValue}>5 years</Text>
            </View>
          </View>
          <View style={styles.profileInfoRow}>
            <Ionicons name="school-outline" size={20} color={COLORS.TEXT_SECONDARY} />
            <View style={styles.profileInfoContent}>
              <Text style={styles.profileInfoLabel}>Education</Text>
              <Text style={styles.profileInfoValue}>B.Tech Computer Science</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Resume</Text>
        <Pressable style={styles.resumeCard}>
          <Ionicons name="document-text" size={32} color={COLORS.PRIMARY} />
          <View style={styles.resumeInfo}>
            <Text style={styles.resumeName}>{activeResume?.file_name || 'No resume uploaded'}</Text>
            <Text style={styles.resumeSize}>{activeResume ? `${(activeResume.file_size / (1024 * 1024)).toFixed(1)} MB` : ''}</Text>
          </View>
          <Ionicons name="download-outline" size={24} color={COLORS.PRIMARY} />
        </Pressable>
      </View>
    </View>
  );

  const renderSettingsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowContent}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.PRIMARY} />
              <View style={styles.settingsTextContainer}>
                <Text style={styles.settingsLabel}>Push Notifications</Text>
                <Text style={styles.settingsDescription}>Receive job alerts and updates</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2e8f0', true: COLORS.PRIMARY }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={styles.settingsDivider} />
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowContent}>
              <Ionicons name="mail-outline" size={22} color={COLORS.PRIMARY} />
              <View style={styles.settingsTextContainer}>
                <Text style={styles.settingsLabel}>Email Notifications</Text>
                <Text style={styles.settingsDescription}>Get updates via email</Text>
              </View>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#e2e8f0', true: COLORS.PRIMARY }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/edit-profile')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="person-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/change-password')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="lock-closed-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/manage-resume')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="document-text-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Manage Resume</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Preferences</Text>
        <View style={styles.settingsCard}>
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/language')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="language-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Language</Text>
            </View>
            <View style={styles.settingsValueContainer}>
              <Text style={styles.settingsValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
            </View>
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable style={styles.settingsRow}>
            <View style={styles.settingsRowContent}>
              <Ionicons name="moon-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: '#e2e8f0', true: COLORS.PRIMARY }}
              thumbColor="#ffffff"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Support</Text>
        <View style={styles.settingsCard}>
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/chatbot' as any)}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="chatbubbles-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Chat Assistant</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/help-center')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/terms-privacy')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="document-text-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Terms & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
          <View style={styles.settingsDivider} />
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push('/settings/contact-us')}
          >
            <View style={styles.settingsRowContent}>
              <Ionicons name="mail-outline" size={22} color={COLORS.PRIMARY} />
              <Text style={styles.settingsLabel}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.deleteAccountButton}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </Pressable>
    </View>
  );

  useEffect(() => {
    if (activeTab === 'jobs') {
      router.push('/jobs');
      setActiveTab('home');
    } else if (activeTab === 'projects') {
      router.push('/projects');
      setActiveTab('home');
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'profile':
        return renderProfileContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderHomeContent();
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
            <Ionicons name="menu" size={28} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="briefcase" size={22} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.logoText}>GROEI</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.PRIMARY} />
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

      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => router.push('/chatbot' as any)}
      >
        <Ionicons name="chatbubbles" size={24} color={COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>

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
                <Ionicons name="briefcase" size={28} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.drawerLogoText}>GROEI</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDrawerOpen(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.PRIMARY} />
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
                    name={(activeTab === item.id ? item.activeIcon : item.icon) as any}
                    size={24}
                    color={activeTab === item.id ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
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
                <Ionicons name="log-out-outline" size={24} color={COLORS.TEXT_PRIMARY} />
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
    backgroundColor: COLORS.BACKGROUND,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 12 : 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    minHeight: 60,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    flexShrink: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 12,
    minWidth: 0,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 8 : 12,
    padding: 0,
    flexShrink: 0,
  },
  logoText: {
    fontSize: isSmallScreen ? 24 : 26,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: 2,
    flexShrink: 0,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    flexShrink: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
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
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: isSmallScreen ? 16 : 20,
  },
  welcomeCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 20,
    padding: isSmallScreen ? 20 : 24,
    marginBottom: isSmallScreen ? 20 : 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: isSmallScreen ? 26 : 30,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    lineHeight: isSmallScreen ? 20 : 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: isSmallScreen ? 8 : 10,
    marginBottom: isSmallScreen ? 20 : 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%', // Explicit width to ensure equal distribution
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 12 : 16,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    // minWidth: 0,
    maxWidth: '100%',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconContainer: {
    width: isSmallScreen ? 40 : 44,
    height: isSmallScreen ? 40 : 44,
    borderRadius: isSmallScreen ? 20 : 22,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  statNumber: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 14 : 16,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    letterSpacing: 0.3,
  },
  jobCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 18,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobIconContainer: {
    width: isSmallScreen ? 44 : 48,
    height: isSmallScreen ? 44 : 48,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  jobDescription: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  jobTag: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jobTagText: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  matchBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchText: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: isSmallScreen ? 12 : 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    padding: 0,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: isSmallScreen ? 14 : 16,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  jobsList: {
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 18,
    padding: isSmallScreen ? 18 : 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectIconContainer: {
    width: isSmallScreen ? 52 : 56,
    height: isSmallScreen ? 52 : 56,
    borderRadius: 14,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  projectClient: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: isSmallScreen ? 12 : 14,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.SECONDARY,
  },
  statusBadgeCompleted: {
    backgroundColor: COLORS.SUCCESS + '30',
  },
  statusText: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  statusTextActive: {
    color: COLORS.PRIMARY,
  },
  statusTextCompleted: {
    color: '#155724',
  },
  projectDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  projectDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectDetailText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  projectActions: {
    flexDirection: 'row',
    gap: 12,
  },
  projectActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
  },
  projectActionText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 28 : 32,
    paddingBottom: isSmallScreen ? 24 : 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  profileAvatar: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: isSmallScreen ? 50 : 60,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
    borderWidth: 4,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileName: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: isSmallScreen ? 14 : 15,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 10 : 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
  },
  editProfileText: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  profileSection: {
    marginBottom: isSmallScreen ? 24 : 28,
  },
  profileSectionTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: isSmallScreen ? 12 : 16,
    letterSpacing: 0.3,
  },
  profileInfoCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 12 : 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  profileInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  profileInfoLabel: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resumeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resumeName: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  resumeSize: {
    fontSize: isSmallScreen ? 12 : 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: isSmallScreen ? 24 : 28,
  },
  settingsSectionTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: isSmallScreen ? 12 : 16,
    letterSpacing: 0.3,
  },
  settingsCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 16 : 18,
  },
  settingsRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingsLabel: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: isSmallScreen ? 12 : 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  settingsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: isSmallScreen ? 14 : 15,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginLeft: isSmallScreen ? 16 : 20,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: isSmallScreen ? 16 : 18,
    borderRadius: 14,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 2,
    borderColor: COLORS.ERROR,
    marginTop: isSmallScreen ? 8 : 12,
    marginBottom: isSmallScreen ? 20 : 24,
  },
  deleteAccountText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.5,
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
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    zIndex: 999,
    shadowColor: COLORS.PRIMARY,
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
    borderBottomColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: 2,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.SECONDARY,
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
    backgroundColor: COLORS.SECONDARY,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 16,
  },
  menuItemTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },
  drawerFooter: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
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
  chatbotButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

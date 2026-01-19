import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Modal, TextInput, Pressable, Alert, Clipboard, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { interviewsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface Interview {
  id: number;
  job_title?: string;
  jobTitle?: string;
  company?: string;
  date?: string;
  time?: string;
  type?: string;
  interviewer?: string;
  location?: string;
  status?: string;
  match?: number;
  meeting_link?: string;
  meetingLink?: string;
  meeting_id?: string;
  meetingId?: string;
  password?: string;
}

export default function InterviewsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await interviewsApi.getAll();
      const interviewsList = Array.isArray(response) ? response : (response.data || []);
      setInterviews(interviewsList);
    } catch (err: any) {
      console.error('Error loading interviews:', err);
      setError(err.message || 'Failed to load interviews');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredInterviews = interviews.filter(interview => {
    if (activeFilter === 'all') return true;
    return interview.status === activeFilter;
  });

  const upcomingCount = interviews.filter(i => i.status === 'scheduled').length;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Scheduled', color: COLORS.INFO, icon: 'time-outline' };
      case 'completed':
        return { label: 'Completed', color: COLORS.SUCCESS, icon: 'checkmark-circle' };
      case 'cancelled':
        return { label: 'Cancelled', color: COLORS.ERROR, icon: 'close-circle' };
      default:
        return { label: status, color: COLORS.TEXT_SECONDARY, icon: 'help-circle' };
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Video Call' ? 'videocam-outline' : 'location-outline';
  };

  const handleJoinInterview = (interview: any) => {
    setSelectedInterview(interview);
    setShowJoinModal(true);
  };

  const handleCopy = (text: string) => {
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(text);
      Alert.alert('Copied', 'Copied to clipboard');
    }
  };

  const handleOpenMeeting = async () => {
    const meetingLink = selectedInterview?.meeting_link || selectedInterview?.meetingLink;
    if (meetingLink) {
      try {
        const canOpen = await Linking.canOpenURL(meetingLink);
        if (canOpen) {
          await Linking.openURL(meetingLink);
        }
      } catch (error) {
        console.error('Failed to open meeting link:', error);
        Alert.alert('Error', 'Could not open meeting link');
      }
    }
    setShowJoinModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interviews</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{upcomingCount} upcoming interviews</Text>

        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, activeFilter === filter.id && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading interviews...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadInterviews}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredInterviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyTitle}>No Interviews</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'all'
                  ? 'You don\'t have any interviews scheduled yet'
                  : `No ${activeFilter} interviews found`}
              </Text>
            </View>
          ) : (
            filteredInterviews.map((interview) => {
              const statusInfo = getStatusInfo(interview.status || '');
              const jobTitle = interview.job_title || interview.jobTitle || 'Job Title';
              const company = interview.company || 'Company';
              const date = interview.date || 'Date TBD';
              const time = interview.time || 'Time TBD';
              const type = interview.type || 'Video Call';
              const interviewer = interview.interviewer || 'Interviewer';
              const location = interview.location || 'Location TBD';
              const match = interview.match || 0;
              const meetingLink = interview.meeting_link || interview.meetingLink;
              const meetingId = interview.meeting_id || interview.meetingId;
              const password = interview.password;

              return (
                <View key={interview.id} style={styles.interviewCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.jobInfo}>
                      <View style={styles.jobIcon}>
                        <Ionicons name="business" size={20} color={COLORS.PRIMARY} />
                      </View>
                      <View style={styles.jobDetails}>
                        <Text style={styles.jobTitle}>{jobTitle}</Text>
                        <Text style={styles.companyName}>{company}</Text>
                      </View>
                    </View>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '30' }]}>
                        <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                      {match > 0 && <Text style={styles.matchText}>Match: {match}%</Text>}
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name={getTypeIcon(type) as any} size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="person-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.detailText}>{interviewer}</Text>
                    </View>
                  </View>

                  <View style={styles.locationBox}>
                    <Text style={styles.locationLabel}>Location/Details:</Text>
                    <Text style={styles.locationText}>{location}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    {interview.status === 'scheduled' && (
                      <>
                        {meetingLink && (
                          <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => handleJoinInterview({ ...interview, meetingLink, meetingId, password })}
                          >
                            <Ionicons name="videocam" size={18} color="#ffffff" />
                            <Text style={styles.primaryButtonText}>Join Interview</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {interview.status === 'completed' && (
                      <>
                        <TouchableOpacity style={styles.secondaryButton}>
                          <Text style={styles.secondaryButtonText}>View Feedback</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chatButton}>
                          <Ionicons name="chatbubble-outline" size={18} color={COLORS.PRIMARY} />
                        </TouchableOpacity>
                      </>
                    )}
                    {interview.status === 'cancelled' && (
                      <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>View Details</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowJoinModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Interview</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowJoinModal(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            {selectedInterview && (() => {
              const jobTitle = selectedInterview.job_title || selectedInterview.jobTitle || 'Job Title';
              const company = selectedInterview.company || 'Company';
              const date = selectedInterview.date || 'Date TBD';
              const time = selectedInterview.time || 'Time TBD';
              const interviewer = selectedInterview.interviewer || 'Interviewer';
              const meetingLink = selectedInterview.meeting_link || selectedInterview.meetingLink || '';
              const meetingId = selectedInterview.meeting_id || selectedInterview.meetingId || '';
              const password = selectedInterview.password || '';

              return (
                <>
                  <View style={styles.interviewInfo}>
                    <Text style={styles.modalJobTitle}>{jobTitle}</Text>
                    <Text style={styles.modalCompany}>{company}</Text>

                    <View style={styles.modalDetailRow}>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.modalDetailText}>
                        {date} at {time}
                      </Text>
                    </View>

                    <View style={styles.modalDetailRow}>
                      <Ionicons name="person-outline" size={18} color={COLORS.TEXT_SECONDARY} />
                      <Text style={styles.modalDetailText}>
                        Interviewer: {interviewer}
                      </Text>
                    </View>
                  </View>

                  {meetingLink && (
                    <View style={styles.meetingSection}>
                      <Text style={styles.sectionTitle}>Meeting Information</Text>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Meeting Link</Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.input}
                            value={meetingLink}
                            editable={false}
                            selectTextOnFocus
                          />
                          <View style={styles.inputActions}>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => handleCopy(meetingLink)}
                            >
                              <Ionicons name="copy-outline" size={20} color={COLORS.PRIMARY} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={handleOpenMeeting}
                            >
                              <Ionicons name="open-outline" size={20} color={COLORS.PRIMARY} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {meetingId && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Meeting ID</Text>
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={styles.input}
                              value={meetingId}
                              editable={false}
                              selectTextOnFocus
                            />
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => handleCopy(meetingId)}
                            >
                              <Ionicons name="copy-outline" size={20} color={COLORS.PRIMARY} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {password && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Password</Text>
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={styles.input}
                              value={password}
                              editable={false}
                              selectTextOnFocus
                              secureTextEntry
                            />
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => handleCopy(password)}
                            >
                              <Ionicons name="copy-outline" size={20} color={COLORS.PRIMARY} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </>
              );
            })()}

            {selectedInterview && (selectedInterview.meeting_link || selectedInterview.meetingLink) && (
              <TouchableOpacity style={styles.openMeetingButton} onPress={handleOpenMeeting}>
                <Ionicons name="videocam" size={20} color={COLORS.TEXT_PRIMARY} />
                <Text style={styles.openMeetingText}>Open Meeting</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 20,
  },
  title: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterTabActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  filterTextActive: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  interviewCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    width: '100%',
    alignSelf: 'stretch',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobDetails: {
    flex: 1,
    minWidth: 0,
  },
  jobTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    flexShrink: 1,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flexShrink: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexBasis: '48%',
    minWidth: 0,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    flexShrink: 1,
  },
  locationBox: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 16 : 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 20,
    padding: isSmallScreen ? 20 : 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interviewInfo: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalJobTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  modalCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  meetingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
    paddingRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  openMeetingButton: {
    width: '100%',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  openMeetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
});

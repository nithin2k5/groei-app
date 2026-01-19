import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { applicationsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface Application {
  id: number;
  job_title?: string;
  jobTitle?: string;
  company?: string;
  status?: string;
  applied_date?: string;
  appliedDate?: string;
  match?: number;
  icon?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'under_review':
      return '#3b82f6';
    case 'shortlisted':
      return '#10b981';
    case 'interview':
      return '#f59e0b';
    case 'rejected':
      return '#ef4444';
    case 'accepted':
      return '#10b981';
    default:
      return COLORS.TEXT_SECONDARY;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'under_review':
      return 'time-outline';
    case 'shortlisted':
      return 'checkmark-circle-outline';
    case 'interview':
      return 'calendar-outline';
    case 'rejected':
      return 'close-circle-outline';
    case 'accepted':
      return 'checkmark-circle';
    default:
      return 'help-circle-outline';
  }
};

export default function ApplicationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [])
  );

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsApi.getAll();
      const apps = Array.isArray(response) ? response : (response.data || []);
      setApplications(apps);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'under_review': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interview': return 'Interview Scheduled';
      case 'rejected': return 'Not Selected';
      case 'accepted': return 'Accepted';
      default: return status || 'Pending';
    }
  };

  const getJobIcon = (title?: string) => {
    if (!title) return 'briefcase';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('react') || lowerTitle.includes('frontend')) return 'code';
    if (lowerTitle.includes('backend') || lowerTitle.includes('server')) return 'server';
    if (lowerTitle.includes('design') || lowerTitle.includes('ui/ux')) return 'color-palette';
    if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) return 'layers';
    return 'briefcase';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Applications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filter === 'under_review' && styles.filterChipActive]}
            onPress={() => setFilter('under_review')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'under_review' && styles.filterChipTextActive,
              ]}
            >
              Under Review
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filter === 'shortlisted' && styles.filterChipActive]}
            onPress={() => setFilter('shortlisted')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'shortlisted' && styles.filterChipTextActive,
              ]}
            >
              Shortlisted
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filter === 'interview' && styles.filterChipActive]}
            onPress={() => setFilter('interview')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'interview' && styles.filterChipTextActive,
              ]}
            >
              Interview
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadApplications}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No Applications Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? "You haven't applied to any jobs yet."
                : `No applications with this status.`}
            </Text>
            {filter !== 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setFilter('all')}
              >
                <Text style={styles.emptyButtonText}>View All Applications</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredApplications.map((application) => {
            const jobTitle = application.job_title || application.jobTitle || 'Job Title';
            const company = application.company || 'Company';
            const status = application.status || 'pending';
            const appliedDate = application.applied_date || application.appliedDate;
            const match = application.match || 0;
            const icon = application.icon || getJobIcon(jobTitle);

            return (
              <Pressable
                key={application.id}
                style={styles.applicationCard}
                onPress={() => {
                  router.push({
                    pathname: '/application-status',
                    params: {
                      applicationId: application.id.toString(),
                      jobTitle: jobTitle,
                      company: company,
                      status: status,
                    },
                  });
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={COLORS.PRIMARY}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.jobTitle}>{jobTitle}</Text>
                    <Text style={styles.companyName}>{company}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(status)}15` },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(status) as any}
                      size={14}
                      color={getStatusColor(status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(status) },
                      ]}
                    >
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.footerText}>
                      Applied {formatDate(appliedDate)}
                    </Text>
                  </View>
                  {match > 0 && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{match}% Match</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardAction}>
                  <Text style={styles.actionText}>View Status</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.PRIMARY} />
                </View>
              </Pressable>
            );
          })
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
    color: COLORS.PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    paddingVertical: isSmallScreen ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  filterScroll: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isSmallScreen ? 16 : 24,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 60 : 80,
  },
  emptyTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '700',
  },
  applicationCard: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  iconContainer: {
    width: isSmallScreen ? 48 : 56,
    height: isSmallScreen ? 48 : 56,
    borderRadius: 12,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 12 : 16,
  },
  cardInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  companyName: {
    fontSize: isSmallScreen ? 15 : 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
    paddingTop: isSmallScreen ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  matchBadge: {
    backgroundColor: COLORS.SUCCESS + '30',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderRadius: 12,
  },
  matchText: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '700',
    color: '#065f46',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmallScreen ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  actionText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
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
});

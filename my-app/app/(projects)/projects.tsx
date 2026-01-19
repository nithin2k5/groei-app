import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { jobsApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface Project {
  id: number;
  title: string;
  client?: string;
  budget?: string;
  duration?: string;
  skills?: string[];
  match?: number;
  status?: string;
  posted?: string;
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProjects();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = { type: 'project' };
      if (searchQuery) filters.search = searchQuery;
      if (filter === 'active') filters.status = 'active';
      if (filter === 'completed') filters.status = 'completed';

      const response = await jobsApi.getAll(filters);
      const allProjects = Array.isArray(response) ? response : (response.data || response.projects || []);
      setProjects(allProjects);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSkills = (skills?: string[] | string) => {
    if (!skills) return [];
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
    return skills;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          {['all', 'active', 'completed'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[styles.filterChip, filter === filterOption && styles.filterChipActive]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[styles.filterChipText, filter === filterOption && styles.filterChipTextActive]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading projects...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.ERROR} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={64} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => {
                router.push({
                  pathname: '/(projects)/project-detail' as any,
                  params: {
                    id: project.id.toString(),
                    title: project.title,
                    client: project.client || '',
                    budget: project.budget || '',
                    duration: project.duration || '',
                    skills: formatSkills(project.skills).join(','),
                    match: project.match?.toString() || '0',
                    status: project.status || 'active',
                  },
                });
              }}
            >
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectClient}>{project.client}</Text>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{project.match}% Match</Text>
                </View>
              </View>
              <View style={styles.projectDetails}>
                {project.budget && (
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{project.budget}</Text>
                  </View>
                )}
                {project.duration && (
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.detailText}>{project.duration}</Text>
                  </View>
                )}
              </View>
              {formatSkills(project.skills).length > 0 && (
                <View style={styles.skillsContainer}>
                  {formatSkills(project.skills).map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
              {project.status && (
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, project.status === 'active' && styles.statusDotActive]} />
                  <Text style={styles.statusText}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Text>
                </View>
              )}
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
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: 13,
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
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingBottom: 24,
  },
  projectCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  projectClient: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  matchBadge: {
    backgroundColor: COLORS.PRIMARY + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  projectDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  statusDotActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

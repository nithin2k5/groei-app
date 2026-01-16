import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function ProfileSetupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputLayouts = useRef<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    experience: '',
    currentPosition: '',
    skills: '',
    education: '',
    languages: '',
    linkedin: '',
    portfolio: '',
    jobType: '',
    salaryExpectation: '',
    availability: '',
    workLocation: '',
    workAuthorization: '',
    resume: null as string | null,
  });
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const { signIn } = useAuth();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) return true;
      
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      } else {
        router.back();
        return true;
      }
    });

    return () => backHandler.remove();
  }, [currentStep, loading, router]);

  const steps = [
    { number: 1, title: 'PERSONAL INFO' },
    { number: 2, title: 'EXPERIENCE' },
    { number: 3, title: 'JOB PREFERENCES' },
    { number: 4, title: 'RESUME' },
  ];

  const handleNext = () => {
    if (loading) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (loading) return;
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (loading) return;
    
    setLoading(true);
    signIn();
    
    setTimeout(() => {
      setLoading(false);
      router.replace('/dashboard');
    }, 1500);
  };

  const handleResumeUpload = () => {
    // TODO: Implement file picker
    setFormData({ ...formData, resume: 'resume.pdf' });
  };

  const handleInputFocus = (inputKey: string) => {
    setTimeout(() => {
      const y = inputLayouts.current[inputKey];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
      }
    }, 100);
  };

  const handleInputLayout = (inputKey: string, event: any) => {
    inputLayouts.current[inputKey] = event.nativeEvent.layout.y;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
              PERSONAL INFORMATION
            </Text>
            <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
              Help us get to know you better
            </Text>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('fullName', e)}
            >
              <Ionicons name="person-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Full Name"
                placeholderTextColor="#a0aec0"
                value={formData.fullName}
                onChangeText={(value) => setFormData({ ...formData, fullName: value })}
                autoCapitalize="words"
                editable={!loading}
                onFocus={() => handleInputFocus('fullName')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('phone', e)}
            >
              <Ionicons name="call-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Phone Number"
                placeholderTextColor="#a0aec0"
                value={formData.phone}
                onChangeText={(value) => setFormData({ ...formData, phone: value })}
                keyboardType="phone-pad"
                editable={!loading}
                onFocus={() => handleInputFocus('phone')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('location', e)}
            >
              <Ionicons name="location-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Location (City, Country)"
                placeholderTextColor="#a0aec0"
                value={formData.location}
                onChangeText={(value) => setFormData({ ...formData, location: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('location')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('languages', e)}
            >
              <Ionicons name="language-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Languages (e.g., English, Spanish, French)"
                placeholderTextColor="#a0aec0"
                value={formData.languages}
                onChangeText={(value) => setFormData({ ...formData, languages: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('languages')}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
              EXPERIENCE & SKILLS
            </Text>
            <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
              Tell us about your professional background
            </Text>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('experience', e)}
            >
              <Ionicons name="briefcase-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Years of Experience"
                placeholderTextColor="#a0aec0"
                value={formData.experience}
                onChangeText={(value) => setFormData({ ...formData, experience: value })}
                keyboardType="number-pad"
                editable={!loading}
                onFocus={() => handleInputFocus('experience')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('currentPosition', e)}
            >
              <Ionicons name="person-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Current Position/Job Title"
                placeholderTextColor="#a0aec0"
                value={formData.currentPosition}
                onChangeText={(value) => setFormData({ ...formData, currentPosition: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('currentPosition')}
              />
            </View>

            <View
              style={[styles.textAreaContainer, isSmallScreen && styles.textAreaContainerSmall]}
              onLayout={(e) => handleInputLayout('skills', e)}
            >
              <Ionicons name="code-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.textArea, isSmallScreen && styles.textAreaSmall]}
                placeholder="Skills (e.g., React, Node.js, Python)"
                placeholderTextColor="#a0aec0"
                value={formData.skills}
                onChangeText={(value) => setFormData({ ...formData, skills: value })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
                onFocus={() => handleInputFocus('skills')}
              />
            </View>

            <View
              style={[styles.textAreaContainer, isSmallScreen && styles.textAreaContainerSmall]}
              onLayout={(e) => handleInputLayout('education', e)}
            >
              <Ionicons name="school-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.textArea, isSmallScreen && styles.textAreaSmall]}
                placeholder="Education (e.g., B.Tech Computer Science, MIT)"
                placeholderTextColor="#a0aec0"
                value={formData.education}
                onChangeText={(value) => setFormData({ ...formData, education: value })}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                editable={!loading}
                onFocus={() => handleInputFocus('education')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('linkedin', e)}
            >
              <Ionicons name="logo-linkedin" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="LinkedIn Profile URL (Optional)"
                placeholderTextColor="#a0aec0"
                value={formData.linkedin}
                onChangeText={(value) => setFormData({ ...formData, linkedin: value })}
                keyboardType="url"
                autoCapitalize="none"
                editable={!loading}
                onFocus={() => handleInputFocus('linkedin')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('portfolio', e)}
            >
              <Ionicons name="globe-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Portfolio/Website URL (Optional)"
                placeholderTextColor="#a0aec0"
                value={formData.portfolio}
                onChangeText={(value) => setFormData({ ...formData, portfolio: value })}
                keyboardType="url"
                autoCapitalize="none"
                editable={!loading}
                onFocus={() => handleInputFocus('portfolio')}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
              JOB PREFERENCES
            </Text>
            <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
              Tell us what you're looking for
            </Text>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('jobType', e)}
            >
              <Ionicons name="briefcase-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Job Type (Full-time, Part-time, Contract, Freelance)"
                placeholderTextColor="#a0aec0"
                value={formData.jobType}
                onChangeText={(value) => setFormData({ ...formData, jobType: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('jobType')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('salaryExpectation', e)}
            >
              <Ionicons name="cash-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Salary Expectation (e.g., $50k-$70k or Negotiable)"
                placeholderTextColor="#a0aec0"
                value={formData.salaryExpectation}
                onChangeText={(value) => setFormData({ ...formData, salaryExpectation: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('salaryExpectation')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('availability', e)}
            >
              <Ionicons name="calendar-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Availability (Immediately, 2 weeks, 1 month)"
                placeholderTextColor="#a0aec0"
                value={formData.availability}
                onChangeText={(value) => setFormData({ ...formData, availability: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('availability')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('workLocation', e)}
            >
              <Ionicons name="location-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Work Location (Remote, Hybrid, On-site)"
                placeholderTextColor="#a0aec0"
                value={formData.workLocation}
                onChangeText={(value) => setFormData({ ...formData, workLocation: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('workLocation')}
              />
            </View>

            <View
              style={[styles.inputContainer, isSmallScreen && styles.inputContainerSmall]}
              onLayout={(e) => handleInputLayout('workAuthorization', e)}
            >
              <Ionicons name="document-text-outline" size={isSmallScreen ? 18 : 20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isSmallScreen && styles.inputSmall]}
                placeholder="Work Authorization (e.g., US Citizen, H1B, OPT)"
                placeholderTextColor="#a0aec0"
                value={formData.workAuthorization}
                onChangeText={(value) => setFormData({ ...formData, workAuthorization: value })}
                editable={!loading}
                onFocus={() => handleInputFocus('workAuthorization')}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, isSmallScreen && styles.stepTitleSmall]}>
              UPLOAD RESUME
            </Text>
            <Text style={[styles.stepDescription, isSmallScreen && styles.stepDescriptionSmall]}>
              Upload your resume to get better job matches
            </Text>

            <Pressable
              style={[styles.resumeUploadContainer, isSmallScreen && styles.resumeUploadContainerSmall]}
              onPress={handleResumeUpload}
              disabled={loading}
            >
              <View style={styles.resumeIconContainer}>
                <Ionicons name="document-text" size={48} color="#041F2B" />
              </View>
              {formData.resume ? (
                <>
                  <Text style={[styles.resumeText, isSmallScreen && styles.resumeTextSmall]}>
                    {formData.resume}
                  </Text>
                  <Text style={[styles.resumeSubtext, isSmallScreen && styles.resumeSubtextSmall]}>
                    Tap to change
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.resumeText, isSmallScreen && styles.resumeTextSmall]}>
                    TAP TO UPLOAD RESUME
                  </Text>
                  <Text style={[styles.resumeSubtext, isSmallScreen && styles.resumeSubtextSmall]}>
                    PDF, DOC, DOCX (Max 5MB)
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack} 
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color={loading ? '#cbd5e0' : (currentStep === 1 ? '#cbd5e0' : '#041F2B')} />
            </TouchableOpacity>
            <View style={styles.stepsContainer}>
              {steps.map((step) => (
                <View key={step.number} style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep >= step.number && styles.stepCircleActive,
                      currentStep === step.number && styles.stepCircleCurrent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        currentStep >= step.number && styles.stepNumberActive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  </View>
                  {step.number < 4 && (
                    <View
                      style={[
                        styles.stepLine,
                        currentStep > step.number && styles.stepLineActive,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.content}>
          {renderStepContent()}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <Pressable
                style={[styles.backButtonStyle, isSmallScreen && styles.backButtonStyleSmall]}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={[styles.backButtonText, isSmallScreen && styles.backButtonTextSmall]}>
                  BACK
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.nextButton,
                loading && styles.nextButtonDisabled,
                isSmallScreen && styles.nextButtonSmall,
              ]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={[styles.nextButtonText, isSmallScreen && styles.nextButtonTextSmall]}>
                    {currentStep === 4 ? 'COMPLETE SETUP' : 'NEXT'}
                  </Text>
                  <Ionicons
                    name={currentStep === 4 ? 'checkmark-circle' : 'arrow-forward'}
                    size={isSmallScreen ? 18 : 20}
                    color="#ffffff"
                  />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    flexShrink: 0,
  },
  headerSpacer: {
    width: 40,
    flexShrink: 0,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7fa',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#041F2B',
    borderColor: '#041F2B',
  },
  stepCircleCurrent: {
    borderWidth: 3,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a5568',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#041F2B',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stepContent: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#041F2B',
    marginBottom: 8,
    letterSpacing: 1,
  },
  stepTitleSmall: {
    fontSize: 24,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 22,
  },
  stepDescriptionSmall: {
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    height: 56,
    minHeight: 56,
    width: '100%',
  },
  inputContainerSmall: {
    height: 52,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 12,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#041F2B',
    fontWeight: '500',
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputSmall: {
    fontSize: 15,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 100,
    width: '100%',
  },
  textAreaContainerSmall: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 90,
    marginBottom: 14,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#041F2B',
    fontWeight: '500',
    minHeight: 80,
    padding: 0,
    margin: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    includeFontPadding: false,
  },
  textAreaSmall: {
    fontSize: 15,
    minHeight: 70,
  },
  resumeUploadContainer: {
    backgroundColor: '#f8fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 200,
  },
  resumeUploadContainerSmall: {
    padding: 32,
    minHeight: 180,
  },
  resumeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resumeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#041F2B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  resumeTextSmall: {
    fontSize: 16,
    marginBottom: 6,
  },
  resumeSubtext: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  resumeSubtextSmall: {
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
    paddingBottom: 20,
  },
  backButtonStyle: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#041F2B',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  backButtonStyleSmall: {
    paddingVertical: 14,
    minHeight: 48,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#041F2B',
    letterSpacing: 1,
  },
  backButtonTextSmall: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#041F2B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#041F2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
  },
  nextButtonSmall: {
    paddingVertical: 14,
    minHeight: 48,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 1,
  },
  nextButtonTextSmall: {
    fontSize: 15,
    marginRight: 6,
    letterSpacing: 0.5,
  },
});

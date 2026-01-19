import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, ScrollView, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';
import { authApi } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const { signIn } = useAuth();

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const lastChar = value[value.length - 1];
      const newOtp = [...otp];
      newOtp[index] = lastChar;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    const key = e.nativeEvent.key;
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleVerify = async () => {
    if (loading) return;

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOTP(email, otpCode);
      if (response.verified) {
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
        }
        signIn();
        router.replace({
          pathname: '/profile-setup',
          params: { email },
        });
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) return true;
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, [loading]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.content}>
            <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (!loading) {
                    router.back();
                  }
                }}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={24} color={loading ? COLORS.TEXT_SECONDARY : COLORS.PRIMARY} />
              </TouchableOpacity>
              <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
                <Ionicons name="mail" size={isSmallScreen ? 24 : 28} color={COLORS.PRIMARY} />
              </View>
              <Text style={[styles.logoText, isSmallScreen && styles.logoTextSmall]}>GROEI</Text>
            </View>

            <View style={[styles.authContainer, isSmallScreen && styles.authContainerSmall]}>
              <View style={styles.formContainer}>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                  VERIFY YOUR EMAIL
                </Text>
                <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
                  We've sent a 6-digit code to{'\n'}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        isSmallScreen && styles.otpInputSmall,
                        digit && styles.otpInputFilled,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      editable={!loading}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <Pressable
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                    isSmallScreen && styles.submitButtonSmall,
                    otp.join('').length !== 6 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleVerify}
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.TEXT_PRIMARY} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.submitButtonText, isSmallScreen && styles.submitButtonTextSmall]}>
                        VERIFY OTP
                      </Text>
                      <Ionicons name="checkmark-circle" size={isSmallScreen ? 18 : 20} color="#ffffff" />
                    </>
                  )}
                </Pressable>

                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, isSmallScreen && styles.resendTextSmall]}>
                    Didn't receive the code?
                  </Text>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResend} disabled={loading}>
                      <Text style={[styles.resendLink, isSmallScreen && styles.resendLinkSmall]}>
                        RESEND OTP
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.timerText, isSmallScreen && styles.timerTextSmall]}>
                      Resend in {timer}s
                    </Text>
                  )}
                </View>
              </View>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerSmall: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 20,
    padding: 8,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainerSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: 2,
  },
  logoTextSmall: {
    fontSize: 24,
    letterSpacing: 1.5,
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  authContainerSmall: {
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 24,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  subtitleSmall: {
    fontSize: 13,
    marginBottom: 28,
    lineHeight: 18,
  },
  emailText: {
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
    margin: 0,
  },
  otpInputSmall: {
    height: 52,
    fontSize: 20,
  },
  otpInputFilled: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.BACKGROUND,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
  },
  submitButtonSmall: {
    paddingVertical: 14,
    minHeight: 48,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 1,
  },
  submitButtonTextSmall: {
    fontSize: 15,
    marginRight: 6,
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  resendTextSmall: {
    fontSize: 13,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  resendLinkSmall: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 0.5,
  },
  timerTextSmall: {
    fontSize: 13,
  },
});

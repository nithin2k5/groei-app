import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { authApi } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState<string>('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
    if (!emailParam) {
      Alert.alert('Error', 'Email is required');
      router.replace('/(auth)/forgot-password');
      return;
    }
    setEmail(emailParam);
  }, [params.email]);

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

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyResetOTP(email, otpCode);
      setStep('password');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const otpCode = otp.join('');
      await authApi.resetPassword(email, otpCode, password);
      Alert.alert('Success', 'Password reset successfully! You can now login with your new password.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/auth'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 'password') {
                setStep('otp');
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={64} color={COLORS.PRIMARY} />
            </View>

            {step === 'otp' ? (
              <>
                <Text style={styles.title}>Verify Reset Code</Text>
                <Text style={styles.subtitle}>
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

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                    otp.join('').length !== 6 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.TEXT_PRIMARY} />
                  ) : (
                    <Text style={styles.submitButtonText}>VERIFY CODE</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your new password below</Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.TEXT_PRIMARY} />
                  ) : (
                    <Text style={styles.submitButtonText}>RESET PASSWORD</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    padding: 16,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    padding: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

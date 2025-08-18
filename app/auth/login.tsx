import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import EmailService from '@/services/EmailService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const emailService = EmailService.getInstance();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user exists
      const userExists = await emailService.checkUserExists(email);
      
      if (!userExists) {
        setIsLoading(false);
        Alert.alert(
          'User Not Found',
          'No account found with this email. Would you like to register?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Register', onPress: () => router.push('/auth/register') }
          ]
        );
        return;
      }

      // Verify password
      const passwordValid = await emailService.verifyPassword(email, password);
      
      if (!passwordValid) {
        setIsLoading(false);
        Alert.alert('Error', 'Invalid password. Please try again.');
        return;
      }

      // Send OTP for verification
      const otpResult = await emailService.sendEmailOTP(email);
      
      setIsLoading(false);
      
      if (otpResult.success) {
        setShowOTPModal(true);
        setResendTimer(60); // 60 seconds cooldown
        Alert.alert('OTP Sent', otpResult.message);
      } else {
        Alert.alert('Error', otpResult.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    
    try {
      const verifyResult = await emailService.verifyEmailOTP(email, otp);
      
      setOtpLoading(false);
      
      if (verifyResult.success) {
        // Complete login
        const loginResult = await emailService.loginUser(email, password);
        
        if (loginResult.success) {
          setShowOTPModal(false);
          Alert.alert('Success', 'Login successful!', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') }
          ]);
        } else {
          Alert.alert('Error', loginResult.message);
        }
      } else {
        Alert.alert('Error', verifyResult.message);
      }
    } catch (error) {
      setOtpLoading(false);
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      Alert.alert('Wait', `Please wait ${resendTimer} seconds before requesting a new OTP`);
      return;
    }

    try {
      const result = await emailService.resendOTP(email);
      if (result.success) {
        setResendTimer(60);
        Alert.alert('OTP Sent', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset instructions will be sent to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => console.log('Password reset sent') },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#2563EB', '#1D4ED8', '#1E3A8A']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Shield size={48} color="#ffffff" />
            <Text style={styles.appName}>DigiRakshak</Text>
            <Text style={styles.tagline}>AI Cyber Police for MSMEs</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to protect your business</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={20} color="#6B7280" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color="#6B7280" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#3B82F6', '#1D4ED8']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <UserPlus size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* OTP Modal */}
        <Modal
          visible={showOTPModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOTPModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter OTP</Text>
              <Text style={styles.modalSubtitle}>
                We've sent a 6-digit code to {email}
              </Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowOTPModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleOTPVerification}
                  disabled={otpLoading}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    {otpLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Resend OTP */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={resendTimer > 0}
              >
                <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.securityText}>Bank-level security</Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#BFDBFE',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 0.6,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  securityText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
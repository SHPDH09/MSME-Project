import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, User, Mail, Lock, Building, CreditCard, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import EmailService from '@/services/EmailService';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    gstNumber: '',
    language: 'English',
  });
  const [isLoading, setIsLoading] = useState(false);

  const emailService = EmailService.getInstance();

  const languages = [
    'English',
    'Hindi',
    'Marathi',
    'Gujarati',
    'Bengali',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Punjabi',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name');
      return false;
    }
    if (!formData.gstNumber.trim()) {
      Alert.alert('Error', 'Please enter your GST number');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Register user
      const result = await emailService.registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        language: formData.language,
      });

      setIsLoading(false);

      if (result.success) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully. Please sign in to verify your email.',
          [
            { text: 'OK', onPress: () => router.replace('/auth/login') }
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={40} color="#ffffff" />
              <Text style={styles.appName}>DigiRakshak</Text>
              <Text style={styles.tagline}>Protecting MSMEs in their own language</Text>
            </View>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>Join thousands of protected businesses</Text>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Company Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Building size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.companyName}
                  onChangeText={(value) => handleInputChange('companyName', value)}
                  autoCapitalize="words"
                />
              </View>

              {/* GST Number Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <CreditCard size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="GST Number"
                  placeholderTextColor="#9CA3AF"
                  value={formData.gstNumber}
                  onChangeText={(value) => handleInputChange('gstNumber', value)}
                  autoCapitalize="characters"
                />
              </View>

              {/* Language Selection */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Globe size={20} color="#6B7280" />
                </View>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Preferred Language:</Text>
                  <Picker
                    selectedValue={formData.language}
                    style={styles.picker}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    {languages.map((lang) => (
                      <Picker.Item key={lang} label={lang} value={lang} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color="#6B7280" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#3B82F6', '#1D4ED8']}
                  style={styles.registerButtonGradient}
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  picker: {
    flex: 1,
    color: '#1F2937',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings as SettingsIcon, Globe, Bell, CircleHelp as HelpCircle, Phone, Mail, LogOut, User, Shield, Smartphone } from 'lucide-react-native';

export default function SettingsScreen() {
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    threatAlerts: true,
    darkWebAlerts: true,
    weeklyReports: false,
    emailNotifications: true,
  });

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ];

  const handleLanguageChange = (selectedLanguage: string) => {
    Alert.alert(
      'Change Language',
      `Switch to ${selectedLanguage}? This will restart the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: () => {
            setLanguage(selectedLanguage);
            Alert.alert('Language Changed', `App language changed to ${selectedLanguage}`);
          }
        },
      ]
    );
  };

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Phone', onPress: () => Alert.alert('Call Support', '+91-1800-DIGIRAKSHAK') },
        { text: 'Email', onPress: () => Alert.alert('Email Support', 'support@digirakshak.com') },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logging out...') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.header}>
        <View style={styles.headerContent}>
          <SettingsIcon size={32} color="#ffffff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <User size={20} color="#3B82F6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Account Information</Text>
            <Text style={styles.settingSubtitle}>Rajesh Kumar</Text>
            <Text style={styles.settingSubtitle}>rajesh@kumartextiles.com</Text>
            <Text style={styles.settingSubtitle}>GST: GST123456789</Text>
            <Text style={styles.settingSubtitle}>Registered: Jan 1, 2025</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Shield size={20} color="#10B981" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Security Settings</Text>
            <Text style={styles.settingSubtitle}>Password, 2FA, and login security</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Language Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language / भाषा</Text>
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                language === lang.name && styles.languageItemSelected,
              ]}
              onPress={() => handleLanguageChange(lang.name)}
            >
              <Globe size={20} color={language === lang.name ? '#ffffff' : '#6B7280'} />
              <View style={styles.languageText}>
                <Text
                  style={[
                    styles.languageName,
                    language === lang.name && styles.languageNameSelected,
                  ]}
                >
                  {lang.name}
                </Text>
                <Text
                  style={[
                    styles.languageNative,
                    language === lang.name && styles.languageNativeSelected,
                  ]}
                >
                  {lang.native}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.notificationItem}>
          <View style={styles.settingIcon}>
            <Bell size={20} color="#EF4444" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Threat Alerts</Text>
            <Text style={styles.settingSubtitle}>Get notified of security threats</Text>
          </View>
          <Switch
            value={notifications.threatAlerts}
            onValueChange={() => handleNotificationToggle('threatAlerts')}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={notifications.threatAlerts ? '#3B82F6' : '#9CA3AF'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.settingIcon}>
            <Shield size={20} color="#F59E0B" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Web Alerts</Text>
            <Text style={styles.settingSubtitle}>Notifications for data breaches</Text>
          </View>
          <Switch
            value={notifications.darkWebAlerts}
            onValueChange={() => handleNotificationToggle('darkWebAlerts')}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={notifications.darkWebAlerts ? '#3B82F6' : '#9CA3AF'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.settingIcon}>
            <Mail size={20} color="#10B981" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Weekly Reports</Text>
            <Text style={styles.settingSubtitle}>Cyber health summary emails</Text>
          </View>
          <Switch
            value={notifications.weeklyReports}
            onValueChange={() => handleNotificationToggle('weeklyReports')}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={notifications.weeklyReports ? '#3B82F6' : '#9CA3AF'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.settingIcon}>
            <Smartphone size={20} color="#8B5CF6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Real-time mobile alerts</Text>
          </View>
          <Switch
            value={notifications.emailNotifications}
            onValueChange={() => handleNotificationToggle('emailNotifications')}
            trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
            thumbColor={notifications.emailNotifications ? '#3B82F6' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
          <View style={styles.settingIcon}>
            <Phone size={20} color="#3B82F6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Contact Support</Text>
            <Text style={styles.settingSubtitle}>Get help from our security experts</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <HelpCircle size={20} color="#10B981" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Help Center</Text>
            <Text style={styles.settingSubtitle}>FAQs and security guides</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.appName}>DigiRakshak - AI Cyber Police</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>"Protecting MSMEs in their own language"</Text>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  languageContainer: {
    gap: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
  },
  languageText: {
    marginLeft: 12,
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  languageNameSelected: {
    color: '#ffffff',
  },
  languageNative: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  languageNativeSelected: {
    color: '#E5E7EB',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
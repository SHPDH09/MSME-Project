import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Mail, Globe, FileText, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Activity, Scan } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '@/services/SecurityService';
import VoiceAlertService from '@/services/VoiceAlertService';
import * as DocumentPicker from 'expo-document-picker';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState({
    name: 'Rajesh Kumar',
    company: 'Kumar Textiles',
    gst: 'GST123456789',
  });
  const [threatStats, setThreatStats] = useState({
    threatsDetected: 12,
    darkWebAlerts: 3,
    cyberHealthScore: 85,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWebModal, setShowWebModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [backgroundScanActive, setBackgroundScanActive] = useState(false);

  const securityService = SecurityService.getInstance();
  const voiceService = VoiceAlertService.getInstance();

  useEffect(() => {
    initializeDashboard();
    startBackgroundMonitoring();
    
    return () => {
      securityService.stopBackgroundMonitoring();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      // Update cyber health score
      const healthScore = await securityService.calculateCyberHealth();
      setThreatStats(prev => ({ ...prev, cyberHealthScore: healthScore }));
      
      // Load threat statistics
      const alerts = await AsyncStorage.getItem('security_alerts');
      if (alerts) {
        const alertsData = JSON.parse(alerts);
        const activeThreats = alertsData.filter((alert: any) => alert.status === 'active').length;
        setThreatStats(prev => ({ ...prev, threatsDetected: activeThreats }));
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    }
  };

  const startBackgroundMonitoring = async () => {
    try {
      await securityService.startBackgroundMonitoring();
      setBackgroundScanActive(true);
    } catch (error) {
      console.error('Background monitoring error:', error);
    }
  };

  const threatCards = [
    {
      title: 'Threats Detected',
      value: threatStats.threatsDetected,
      icon: <AlertTriangle size={24} color="#EF4444" />,
      color: '#FEE2E2',
      textColor: '#DC2626',
    },
    {
      title: 'Dark Web Alerts',
      value: threatStats.darkWebAlerts,
      icon: <Shield size={24} color="#F59E0B" />,
      color: '#FEF3C7',
      textColor: '#D97706',
    },
    {
      title: 'Cyber Health Score',
      value: `${threatStats.cyberHealthScore}%`,
      icon: <Activity size={24} color="#10B981" />,
      color: '#D1FAE5',
      textColor: '#059669',
    },
  ];

  const quickActions = [
    {
      title: 'Scan Email',
      description: 'Check email for phishing',
      icon: <Mail size={28} color="#ffffff" />,
      gradient: ['#3B82F6', '#1D4ED8'],
      action: () => setShowEmailModal(true),
    },
    {
      title: 'Scan Website',
      description: 'Verify website safety',
      icon: <Globe size={28} color="#ffffff" />,
      gradient: ['#8B5CF6', '#7C3AED'],
      action: () => setShowWebModal(true),
    },
    {
      title: 'Scan File',
      description: 'Check file for malware',
      icon: <FileText size={28} color="#ffffff" />,
      gradient: ['#10B981', '#059669'],
      action: () => handleScanFile(),
    },
  ];

  const handleScanEmail = async () => {
    if (!emailContent.trim()) {
      Alert.alert('Error', 'Please enter email content to scan');
      return;
    }

    setIsScanning(true);
    
    try {
      const analysis = await securityService.analyzeEmail(
        emailContent,
        'unknown@sender.com',
        'Email Security Scan'
      );

      setIsScanning(false);
      setShowEmailModal(false);
      setEmailContent('');

      if (analysis.isPhishing) {
        await voiceService.playVoiceAlert({
          message: 'Phishing Email Detected',
          language: 'English',
          severity: 'high'
        });

        Alert.alert(
          '🚨 Phishing Email Detected!',
          `Risk Score: ${analysis.riskScore}%\n\nThreats Found:\n${analysis.threats.join('\n')}\n\nDo not click any links or provide personal information.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '✅ Email Appears Safe',
          `Risk Score: ${analysis.riskScore}%\n\nThis email appears to be legitimate, but always verify sender identity before sharing sensitive information.`,
          [{ text: 'OK' }]
        );
      }

      // Save to notification history
      await securityService.addEmailNotification(analysis);
      
    } catch (error) {
      setIsScanning(false);
      Alert.alert('Error', 'Failed to scan email. Please try again.');
    }
  };

  const handleScanWebsite = async () => {
    if (!websiteUrl.trim()) {
      Alert.alert('Error', 'Please enter a website URL to scan');
      return;
    }

    setIsScanning(true);
    
    try {
      const analysis = await securityService.analyzeWebsite(websiteUrl);

      setIsScanning(false);
      setShowWebModal(false);
      setWebsiteUrl('');

      if (analysis.isMalware || analysis.isPhishing) {
        await voiceService.playVoiceAlert({
          message: 'Suspicious Website',
          language: 'English',
          severity: analysis.isMalware ? 'high' : 'medium'
        });

        Alert.alert(
          '⚠️ Suspicious Website Detected!',
          `Risk Score: ${analysis.riskScore}%\n\nThreats Found:\n${analysis.threats.join('\n')}\n\nRecommendations:\n${analysis.recommendations.join('\n')}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '✅ Website Appears Safe',
          `Risk Score: ${analysis.riskScore}%\n\n${analysis.recommendations.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      setIsScanning(false);
      Alert.alert('Error', 'Failed to scan website. Please try again.');
    }
  };

  const handleScanFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setIsScanning(true);

        try {
          const analysis = await securityService.analyzeFile(file.uri, file.name);
          
          setIsScanning(false);

          if (analysis.isMalware) {
            await voiceService.playVoiceAlert({
              message: 'Malware Detected',
              language: 'English',
              severity: 'high'
            });

            Alert.alert(
              '🦠 Malware Detected!',
              `File: ${analysis.fileName}\nRisk Score: ${analysis.riskScore}%\n\nThreats Found:\n${analysis.threats.join('\n')}\n\nRecommendation: Delete this file immediately and run a full system scan.`,
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              '✅ File Appears Safe',
              `File: ${analysis.fileName}\nSize: ${(analysis.fileSize / 1024 / 1024).toFixed(2)} MB\nRisk Score: ${analysis.riskScore}%\n\nThis file appears to be safe, but always scan files from unknown sources.`,
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          setIsScanning(false);
          Alert.alert('Error', 'Failed to scan file. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Shield size={32} color="#ffffff" />
            <View style={styles.headerText}>
              <Text style={styles.appName}>DigiRakshak</Text>
              <Text style={styles.tagline}>AI Cyber Police</Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>नमस्ते, {userProfile.name}</Text>
            <Text style={styles.companyText}>{userProfile.company}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Threat Overview Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Overview</Text>
        <View style={styles.cardsContainer}>
          {threatCards.map((card, index) => (
            <View key={index} style={[styles.threatCard, { backgroundColor: card.color }]}>
              <View style={styles.cardHeader}>
                {card.icon}
                <Text style={[styles.cardValue, { color: card.textColor }]}>{card.value}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: card.textColor }]}>{card.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Security Scans</Text>
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.action}
              activeOpacity={0.8}
            >
              <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                <View style={styles.actionIcon}>
                  {action.icon}
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <CheckCircle size={20} color="#10B981" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Email scan completed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <AlertTriangle size={20} color="#EF4444" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Suspicious link detected</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Shield size={20} color="#3B82F6" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Dark web monitoring active</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Email Scan Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan Email Content</Text>
            <Text style={styles.modalSubtitle}>
              Paste the email content below to check for phishing attempts
            </Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="Paste email content here..."
              value={emailContent}
              onChangeText={setEmailContent}
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowEmailModal(false);
                  setEmailContent('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleScanEmail}
                disabled={isScanning}
              >
                <Scan size={16} color="#ffffff" />
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {isScanning ? 'Scanning...' : 'Scan Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Website Scan Modal */}
      <Modal
        visible={showWebModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWebModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan Website</Text>
            <Text style={styles.modalSubtitle}>
              Enter the website URL to check for security threats
            </Text>
            
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com"
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowWebModal(false);
                  setWebsiteUrl('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleScanWebsite}
                disabled={isScanning}
              >
                <Scan size={16} color="#ffffff" />
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {isScanning ? 'Scanning...' : 'Scan Website'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Background Scan Status */}
      {backgroundScanActive && (
        <View style={styles.backgroundScanIndicator}>
          <Activity size={16} color="#10B981" />
          <Text style={styles.backgroundScanText}>Real-time protection active</Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tagline: {
    fontSize: 12,
    color: '#BFDBFE',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  companyText: {
    fontSize: 12,
    color: '#BFDBFE',
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
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  threatCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  activityContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
    maxHeight: '80%',
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
  emailInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 24,
  },
  urlInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
  },
  backgroundScanIndicator: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  backgroundScanText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});
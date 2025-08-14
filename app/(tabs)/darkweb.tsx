import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Download, Eye, CircleAlert as AlertCircle, Mail, CreditCard, Key, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '@/services/SecurityService';

interface CompromisedData {
  id: string;
  type: 'email' | 'password' | 'gst' | 'credit_card';
  value: string;
  source: string;
  dateFound: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved';
}

export default function DarkWebScreen() {
  const [compromisedData, setCompromisedData] = useState<CompromisedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [scanStatus, setScanStatus] = useState({
    lastScan: new Date().toLocaleString(),
    nextScan: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
    totalBreaches: 0,
    yourDataFound: 0,
  });

  const securityService = SecurityService.getInstance();

  useEffect(() => {
    loadDarkWebData();
  }, []);

  const loadDarkWebData = async () => {
    setIsLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('dark_web_breaches');
      if (storedData) {
        const breaches = JSON.parse(storedData);
        setCompromisedData(breaches);
        setScanStatus(prev => ({
          ...prev,
          yourDataFound: breaches.length,
          totalBreaches: Math.floor(Math.random() * 200) + 100
        }));
      } else {
        // Perform initial scan
        await performDarkWebScan();
      }
    } catch (error) {
      console.error('Failed to load dark web data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performDarkWebScan = async () => {
    setIsLoading(true);
    try {
      // Get user data for scanning
      const userEmail = 'rajesh@kumartextiles.com'; // TODO: Get from user profile
      const userGST = 'GST123456789'; // TODO: Get from user profile
      
      const breaches = await securityService.checkDarkWebBreaches(userEmail, userGST);
      setCompromisedData(breaches);
      
      setScanStatus(prev => ({
        ...prev,
        lastScan: new Date().toLocaleString(),
        nextScan: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
        yourDataFound: breaches.length,
        totalBreaches: Math.floor(Math.random() * 200) + 100
      }));
      
      if (breaches.length > 0) {
        Alert.alert(
          'Dark Web Breach Found!',
          `Found ${breaches.length} compromised data entries. Please review and take necessary actions.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Good News!',
          'No compromised data found in dark web monitoring.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Scan Error', 'Failed to perform dark web scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={20} color="#3B82F6" />;
      case 'password':
        return <Key size={20} color="#EF4444" />;
      case 'gst':
        return <CreditCard size={20} color="#F59E0B" />;
      case 'credit_card':
        return <CreditCard size={20} color="#DC2626" />;
      default:
        return <AlertCircle size={20} color="#6B7280" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleDownloadReport = () => {
    Alert.alert(
      'Download Report',
      'Dark web monitoring report will be downloaded as PDF with detailed findings and recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Downloading report...') },
      ]
    );
  };

  const handleViewDetails = (item: CompromisedData) => {
    Alert.alert(
      'Compromised Data Details',
      `Type: ${item.type}\nSource: ${item.source}\nDate Found: ${item.dateFound}\nSeverity: ${item.severity}\nStatus: ${item.status}`
    );
  };

  const handleStartScan = () => {
    Alert.alert(
      'Start Dark Web Scan',
      'This will scan for your business data on the dark web. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Scan', onPress: performDarkWebScan }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerContent}>
          <Shield size={32} color="#ffffff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Dark Web Monitor</Text>
            <Text style={styles.headerSubtitle}>24/7 data breach monitoring</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Scan Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Monitoring Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Scan:</Text>
            <Text style={styles.statusValue}>{scanStatus.lastScan}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Next Scan:</Text>
            <Text style={styles.statusValue}>{scanStatus.nextScan}</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={handleStartScan}>
            <Text style={styles.scanButtonText}>
              {isLoading ? 'Scanning...' : 'Start Manual Scan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{scanStatus.totalBreaches}</Text>
          <Text style={styles.statLabel}>Total Breaches Monitored</Text>
        </View>
        <View style={[styles.statCard, styles.alertStatCard]}>
          <Text style={styles.alertStatNumber}>{scanStatus.yourDataFound}</Text>
          <Text style={styles.statLabel}>Your Data Found</Text>
        </View>
      </View>

      {/* Compromised Data List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Compromised Data</Text>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadReport}>
            <Download size={16} color="#3B82F6" />
            <Text style={styles.downloadButtonText}>Download Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading dark web data...</Text>
            </View>
          ) : compromisedData.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Shield size={48} color="#10B981" />
              <Text style={styles.noDataTitle}>No Compromised Data Found</Text>
              <Text style={styles.noDataText}>
                Your business data was not found in any known data breaches
              </Text>
            </View>
          ) : (
            compromisedData.map((item) => (
            <View key={item.id} style={styles.dataItem}>
              <View style={styles.dataHeader}>
                <View style={styles.dataIcon}>
                  {getTypeIcon(item.type)}
                </View>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                  <Text style={styles.dataValue}>{item.value}</Text>
                </View>
                <View style={styles.dataStatus}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(item.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {item.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.dataDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Source:</Text>
                  <Text style={styles.detailValue}>{item.source}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.detailValue}>{item.dateFound}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewDetails(item)}
              >
                <Eye size={16} color="#3B82F6" />
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>

              {item.status === 'active' && (
                <View style={styles.actionRecommendation}>
                  <AlertCircle size={16} color="#F59E0B" />
                  <Text style={styles.recommendationText}>
                    {item.type === 'password'
                      ? 'Change your password immediately'
                      : item.type === 'email'
                      ? 'Enable 2FA and monitor for suspicious activity'
                      : 'Contact support for immediate assistance'}
                  </Text>
                </View>
              )}
            </View>
          ))
          )}
        </View>
      </View>

      {/* Security Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Security Recommendations</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Change passwords for all compromised accounts</Text>
          <Text style={styles.tipItem}>• Enable two-factor authentication (2FA)</Text>
          <Text style={styles.tipItem}>• Monitor bank statements and credit reports</Text>
          <Text style={styles.tipItem}>• Use unique passwords for each account</Text>
          <Text style={styles.tipItem}>• Keep software and systems updated</Text>
        </View>
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
  statusContainer: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertStatCard: {
    backgroundColor: '#FEE2E2',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  alertStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  dataList: {
    gap: 16,
  },
  dataItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataIcon: {
    marginRight: 12,
  },
  dataInfo: {
    flex: 1,
  },
  dataType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  dataValue: {
    fontSize: 16,
    color: '#374151',
    marginTop: 2,
  },
  dataStatus: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dataDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    marginBottom: 12,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  actionRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  tipsContainer: {
    margin: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, Shield, CircleCheck as CheckCircle, Clock, Eye, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '@/services/SecurityService';
import VoiceAlertService from '@/services/VoiceAlertService';

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  type: 'phishing' | 'malware' | 'suspicious' | 'darkweb';
  status: 'active' | 'resolved';
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const securityService = SecurityService.getInstance();
  const voiceService = VoiceAlertService.getInstance();

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const storedAlerts = await AsyncStorage.getItem('security_alerts');
      if (storedAlerts) {
        const alertsData = JSON.parse(storedAlerts);
        setAlerts(alertsData);
      } else {
        // Generate sample alerts for demonstration
        const sampleAlerts: SecurityAlert[] = [
          {
            id: '1',
            title: 'Phishing Email Detected',
            description: 'Suspicious email from fake-bank@suspicious.com detected',
            severity: 'high',
            timestamp: new Date().toISOString(),
            type: 'phishing',
            status: 'active',
          },
          {
            id: '2',
            title: 'Malicious Website Blocked',
            description: 'Attempted access to malware-host.com blocked',
            severity: 'medium',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'malware',
            status: 'resolved',
          },
          {
            id: '3',
            title: 'Dark Web Alert',
            description: 'Your email found in recent data breach',
            severity: 'high',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'darkweb',
            status: 'active',
          },
        ];
        setAlerts(sampleAlerts);
        await AsyncStorage.setItem('security_alerts', JSON.stringify(sampleAlerts));
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phishing':
        return <AlertTriangle size={20} color="#EF4444" />;
      case 'malware':
        return <Shield size={20} color="#F59E0B" />;
      case 'darkweb':
        return <Eye size={20} color="#8B5CF6" />;
      default:
        return <AlertTriangle size={20} color="#6B7280" />;
    }
  };

  const handleAlertAction = async (alert: SecurityAlert, action: string) => {
    switch (action) {
      case 'resolve':
        await resolveAlert(alert.id);
        break;
      case 'delete':
        await deleteAlert(alert.id);
        break;
      case 'details':
        showAlertDetails(alert);
        break;
      case 'voice':
        await playVoiceAlert(alert);
        break;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const updatedAlerts = alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      );
      setAlerts(updatedAlerts);
      await AsyncStorage.setItem('security_alerts', JSON.stringify(updatedAlerts));
      Alert.alert('Success', 'Alert marked as resolved');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve alert');
    }
  };

  const deleteAlert = async (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
              setAlerts(updatedAlerts);
              await AsyncStorage.setItem('security_alerts', JSON.stringify(updatedAlerts));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete alert');
            }
          },
        },
      ]
    );
  };

  const showAlertDetails = (alert: SecurityAlert) => {
    Alert.alert(
      alert.title,
      `${alert.description}\n\nSeverity: ${alert.severity.toUpperCase()}\nType: ${alert.type}\nTime: ${new Date(alert.timestamp).toLocaleString()}\nStatus: ${alert.status}`,
      [{ text: 'OK' }]
    );
  };

  const playVoiceAlert = async (alert: SecurityAlert) => {
    try {
      await voiceService.playVoiceAlert({
        message: alert.title,
        language: 'English',
        severity: alert.severity,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to play voice alert');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <View style={styles.headerContent}>
          <AlertTriangle size={32} color="#ffffff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Security Alerts</Text>
            <Text style={styles.headerSubtitle}>Real-time threat notifications</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Alert Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{alerts.filter(a => a.status === 'active').length}</Text>
          <Text style={styles.summaryLabel}>Active Alerts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{alerts.filter(a => a.severity === 'high').length}</Text>
          <Text style={styles.summaryLabel}>High Priority</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{alerts.filter(a => a.status === 'resolved').length}</Text>
          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsList}>
        {alerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.noAlertsTitle}>All Clear!</Text>
            <Text style={styles.noAlertsText}>No security alerts at this time</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIcon}>
                  {getTypeIcon(alert.type)}
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  <Text style={styles.alertTime}>{formatTimestamp(alert.timestamp)}</Text>
                </View>
                <View style={styles.alertStatus}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(alert.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
                  </View>
                  {alert.status === 'resolved' && (
                    <CheckCircle size={16} color="#10B981" style={styles.resolvedIcon} />
                  )}
                </View>
              </View>

              <View style={styles.alertActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAlertAction(alert, 'details')}
                >
                  <Eye size={16} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAlertAction(alert, 'voice')}
                >
                  <Text style={styles.actionButtonText}>🔊 Voice</Text>
                </TouchableOpacity>

                {alert.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={() => handleAlertAction(alert, 'resolve')}
                  >
                    <CheckCircle size={16} color="#ffffff" />
                    <Text style={[styles.actionButtonText, styles.resolveButtonText]}>Resolve</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleAlertAction(alert, 'delete')}
                >
                  <Trash2 size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#FECACA',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  alertsList: {
    padding: 20,
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAlertsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 16,
  },
  noAlertsText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertStatus: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resolvedIcon: {
    marginTop: 4,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  resolveButton: {
    backgroundColor: '#10B981',
  },
  resolveButtonText: {
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
});
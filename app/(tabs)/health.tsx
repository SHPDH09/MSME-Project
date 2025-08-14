import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, TrendingUp, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Download } from 'lucide-react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function CyberHealthScreen() {
  const [healthScore] = useState(85);
  const [healthData] = useState({
    resolvedThreats: 15,
    pendingThreats: 3,
    totalScans: 42,
    lastScanDate: '2025-01-02',
    riskLevel: 'Medium',
    improvements: [
      { category: 'Email Security', score: 92, trend: 'up' },
      { category: 'Web Browsing', score: 78, trend: 'down' },
      { category: 'File Downloads', score: 88, trend: 'up' },
      { category: 'Password Strength', score: 65, trend: 'up' },
    ],
    recentActivity: [
      { date: '2025-01-02', action: 'Malware scan completed', status: 'success' },
      { date: '2025-01-02', action: 'Password updated', status: 'success' },
      { date: '2025-01-01', action: 'Phishing email blocked', status: 'warning' },
      { date: '2025-01-01', action: 'Suspicious link detected', status: 'error' },
      { date: '2024-12-31', action: 'Security scan completed', status: 'success' },
    ],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color="#10B981" />;
      case 'warning':
        return <AlertTriangle size={16} color="#F59E0B" />;
      case 'error':
        return <AlertTriangle size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const renderScoreCircle = (score: number, size: number = 120) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <Svg width={size} height={size} style={styles.scoreCircle}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <SvgText
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.3em"
          fontSize="24"
          fontWeight="bold"
          fill={getScoreColor(score)}
        >
          {score}
        </SvgText>
      </Svg>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <Activity size={32} color="#ffffff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Cyber Health</Text>
            <Text style={styles.headerSubtitle}>Security performance overview</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Health Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Overall Cyber Health Score</Text>
          <View style={styles.scoreDisplay}>
            {renderScoreCircle(healthScore)}
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreText}>{healthScore}/100</Text>
              <Text style={styles.scoreLabel}>
                {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Text>
            </View>
          </View>
          <Text style={styles.lastUpdated}>Last updated: {healthData.lastScanDate}</Text>
        </View>
      </View>

      {/* Threat Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <CheckCircle size={24} color="#10B981" />
          <Text style={styles.summaryNumber}>{healthData.resolvedThreats}</Text>
          <Text style={styles.summaryLabel}>Resolved Threats</Text>
        </View>
        <View style={styles.summaryCard}>
          <AlertTriangle size={24} color="#F59E0B" />
          <Text style={styles.summaryNumber}>{healthData.pendingThreats}</Text>
          <Text style={styles.summaryLabel}>Pending Threats</Text>
        </View>
        <View style={styles.summaryCard}>
          <Shield size={24} color="#3B82F6" />
          <Text style={styles.summaryNumber}>{healthData.totalScans}</Text>
          <Text style={styles.summaryLabel}>Total Scans</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Categories</Text>
        <View style={styles.categoriesContainer}>
          {healthData.improvements.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <View style={styles.categoryScore}>
                  <Text style={[styles.categoryScoreText, { color: getScoreColor(category.score) }]}>
                    {category.score}%
                  </Text>
                  <TrendingUp
                    size={16}
                    color={category.trend === 'up' ? '#10B981' : '#EF4444'}
                    style={{
                      transform: [{ rotate: category.trend === 'up' ? '0deg' : '180deg' }],
                    }}
                  />
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${category.score}%`,
                      backgroundColor: getScoreColor(category.score),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Security Activity</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={16} color="#3B82F6" />
            <Text style={styles.downloadText}>Export Report</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityContainer}>
          {healthData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                {getStatusIcon(activity.status)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Recommendations</Text>
        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationCard}>
            <AlertTriangle size={20} color="#F59E0B" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Improve Password Strength</Text>
              <Text style={styles.recommendationText}>
                Update weak passwords and enable 2FA for better security
              </Text>
            </View>
          </View>
          <View style={styles.recommendationCard}>
            <Shield size={20} color="#3B82F6" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Regular Security Scans</Text>
              <Text style={styles.recommendationText}>
                Schedule weekly scans to maintain optimal security health
              </Text>
            </View>
          </View>
          <View style={styles.recommendationCard}>
            <CheckCircle size={20} color="#10B981" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Employee Training</Text>
              <Text style={styles.recommendationText}>
                Conduct cybersecurity awareness training for your team
              </Text>
            </View>
          </View>
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
    color: '#D1FAE5',
  },
  scoreContainer: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    marginBottom: 12,
  },
  scoreInfo: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  summaryLabel: {
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
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
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
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationContent: {
    marginLeft: 12,
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
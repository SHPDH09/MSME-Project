import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

export interface ThreatAnalysis {
  isPhishing: boolean;
  isMalware: boolean;
  riskScore: number;
  threats: string[];
  recommendations: string[];
}

export interface EmailAnalysis {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  isPhishing: boolean;
  riskScore: number;
  threats: string[];
}

export interface FileAnalysis {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  isMalware: boolean;
  riskScore: number;
  threats: string[];
  scanDate: string;
}

class SecurityService {
  private static instance: SecurityService;
  private isBackgroundScanActive = false;
  private scanInterval: NodeJS.Timeout | null = null;

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Email OTP Service
  async sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP temporarily
      await AsyncStorage.setItem(`otp_${email}`, JSON.stringify({
        otp,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      }));

      // Simulate email sending (in real app, use email service)
      console.log(`OTP sent to ${email}: ${otp}`);
      
      return {
        success: true,
        message: `OTP sent to ${email}. Please check your email.`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyEmailOTP(email: string, enteredOTP: string): Promise<{ success: boolean; message: string }> {
    try {
      const storedData = await AsyncStorage.getItem(`otp_${email}`);
      if (!storedData) {
        return { success: false, message: 'OTP not found or expired' };
      }

      const { otp, expires } = JSON.parse(storedData);
      
      if (Date.now() > expires) {
        await AsyncStorage.removeItem(`otp_${email}`);
        return { success: false, message: 'OTP has expired' };
      }

      if (otp === enteredOTP) {
        await AsyncStorage.removeItem(`otp_${email}`);
        return { success: true, message: 'Email verified successfully' };
      }

      return { success: false, message: 'Invalid OTP' };
    } catch (error) {
      return { success: false, message: 'OTP verification failed' };
    }
  }

  // Email Security Analysis
  async analyzeEmail(emailContent: string, sender: string, subject: string): Promise<EmailAnalysis> {
    const phishingKeywords = [
      'urgent', 'verify account', 'suspended', 'click here', 'limited time',
      'congratulations', 'winner', 'claim now', 'act now', 'verify identity',
      'update payment', 'confirm details', 'security alert', 'account locked'
    ];

    const suspiciousDomains = [
      'tempmail', 'guerrillamail', '10minutemail', 'mailinator',
      'secure-bank', 'paypal-security', 'amazon-security'
    ];

    let riskScore = 0;
    const threats: string[] = [];
    const content = emailContent.toLowerCase();
    const senderLower = sender.toLowerCase();
    const subjectLower = subject.toLowerCase();

    // Check for phishing keywords
    phishingKeywords.forEach(keyword => {
      if (content.includes(keyword) || subjectLower.includes(keyword)) {
        riskScore += 15;
        threats.push(`Suspicious keyword detected: ${keyword}`);
      }
    });

    // Check suspicious domains
    suspiciousDomains.forEach(domain => {
      if (senderLower.includes(domain)) {
        riskScore += 25;
        threats.push(`Suspicious sender domain: ${domain}`);
      }
    });

    // Check for URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex);
    if (urls && urls.length > 3) {
      riskScore += 20;
      threats.push('Multiple suspicious links detected');
    }

    // Check for urgent language
    if (content.includes('urgent') || content.includes('immediate')) {
      riskScore += 10;
      threats.push('Urgent language detected - common phishing tactic');
    }

    const isPhishing = riskScore > 30;

    return {
      id: Date.now().toString(),
      sender,
      subject,
      content: emailContent,
      timestamp: new Date().toISOString(),
      isPhishing,
      riskScore: Math.min(riskScore, 100),
      threats
    };
  }

  // Website Security Analysis
  async analyzeWebsite(url: string): Promise<ThreatAnalysis> {
    const maliciousDomains = [
      'phishing-site', 'fake-bank', 'malware-host', 'suspicious-download',
      'free-money', 'win-prize', 'urgent-update'
    ];

    const suspiciousPatterns = [
      'download-now', 'free-software', 'cracked', 'keygen', 'serial'
    ];

    let riskScore = 0;
    const threats: string[] = [];
    const recommendations: string[] = [];
    const urlLower = url.toLowerCase();

    // Check malicious domains
    maliciousDomains.forEach(domain => {
      if (urlLower.includes(domain)) {
        riskScore += 40;
        threats.push(`Malicious domain detected: ${domain}`);
      }
    });

    // Check suspicious patterns
    suspiciousPatterns.forEach(pattern => {
      if (urlLower.includes(pattern)) {
        riskScore += 20;
        threats.push(`Suspicious pattern detected: ${pattern}`);
      }
    });

    // Check HTTPS
    if (!url.startsWith('https://')) {
      riskScore += 15;
      threats.push('Website does not use secure HTTPS connection');
      recommendations.push('Only visit websites with HTTPS encryption');
    }

    // Check URL length (very long URLs can be suspicious)
    if (url.length > 100) {
      riskScore += 10;
      threats.push('Unusually long URL detected');
    }

    const isMalware = riskScore > 35;
    const isPhishing = riskScore > 25;

    if (threats.length === 0) {
      recommendations.push('Website appears safe, but always verify before entering sensitive information');
    } else {
      recommendations.push('Avoid entering personal or financial information on this website');
      recommendations.push('Consider using antivirus software for additional protection');
    }

    return {
      isPhishing,
      isMalware,
      riskScore: Math.min(riskScore, 100),
      threats,
      recommendations
    };
  }

  // File Security Analysis
  async analyzeFile(filePath: string, fileName: string): Promise<FileAnalysis> {
    try {
      // For mobile compatibility, handle file info safely
      let fileSize = 0;
      try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        fileSize = fileInfo.size || 0;
      } catch (error) {
        console.log('File info not available, using filename analysis only');
      }
      
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      const dangerousExtensions = [
        'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar'
      ];

      const suspiciousExtensions = [
        'zip', 'rar', '7z', 'tar', 'gz'
      ];

      let riskScore = 0;
      const threats: string[] = [];

      // Check dangerous file extensions
      if (dangerousExtensions.includes(fileExtension)) {
        riskScore += 50;
        threats.push(`Potentially dangerous file type: .${fileExtension}`);
      }

      // Check suspicious extensions
      if (suspiciousExtensions.includes(fileExtension)) {
        riskScore += 20;
        threats.push(`Compressed file detected - scan contents carefully`);
      }

      // Check file size (very large files might be suspicious)
      if (fileSize > 100 * 1024 * 1024) { // 100MB
        riskScore += 15;
        threats.push('Large file size detected');
      }

      // Check for suspicious file names
      const suspiciousNames = ['crack', 'keygen', 'patch', 'hack', 'free', 'download'];
      suspiciousNames.forEach(name => {
        if (fileName.toLowerCase().includes(name)) {
          riskScore += 25;
          threats.push(`Suspicious filename pattern: ${name}`);
        }
      });

      const isMalware = riskScore > 40;

      return {
        fileName,
        filePath,
        fileSize,
        fileType: fileExtension,
        isMalware,
        riskScore: Math.min(riskScore, 100),
        threats,
        scanDate: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Failed to analyze file');
    }
  }

  // Background Security Monitoring
  async startBackgroundMonitoring(): Promise<void> {
    if (this.isBackgroundScanActive) return;

    this.isBackgroundScanActive = true;
    
    // Monitor every 30 seconds
    this.scanInterval = setInterval(async () => {
      await this.performBackgroundScan();
    }, 30000);

    console.log('Background security monitoring started');
  }

  async stopBackgroundMonitoring(): Promise<void> {
    this.isBackgroundScanActive = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('Background security monitoring stopped');
  }

  private async performBackgroundScan(): Promise<void> {
    try {
      // Simulate device scanning
      const threats = await this.scanDeviceThreats();
      
      if (threats.length > 0) {
        await this.sendThreatAlert(threats);
      }

      // Update scan history
      await this.updateScanHistory();
    } catch (error) {
      console.error('Background scan error:', error);
    }
  }

  private async scanDeviceThreats(): Promise<string[]> {
    const threats: string[] = [];
    
    // Simulate various threat checks
    const randomThreat = Math.random();
    
    if (randomThreat < 0.1) { // 10% chance
      threats.push('Suspicious network activity detected');
    }
    
    if (randomThreat < 0.05) { // 5% chance
      threats.push('Potentially malicious app behavior detected');
    }

    return threats;
  }

  private async sendThreatAlert(threats: string[]): Promise<void> {
    const alertData = {
      id: Date.now().toString(),
      title: 'Security Threat Detected',
      description: threats.join(', '),
      severity: 'high' as const,
      timestamp: new Date().toISOString(),
      type: 'malware' as const,
      status: 'active' as const,
    };

    // Store alert
    const existingAlerts = await AsyncStorage.getItem('security_alerts');
    const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];
    alerts.unshift(alertData);
    await AsyncStorage.setItem('security_alerts', JSON.stringify(alerts.slice(0, 50))); // Keep last 50

    // Send notification with error handling
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DigiRakshak Security Alert',
          body: alertData.description,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Notification not available, alert stored locally');
    }
  }

  private async updateScanHistory(): Promise<void> {
    const scanData = {
      timestamp: new Date().toISOString(),
      threatsFound: Math.floor(Math.random() * 3),
      filesScanned: Math.floor(Math.random() * 100) + 50,
    };

    const existingHistory = await AsyncStorage.getItem('scan_history');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(scanData);
    await AsyncStorage.setItem('scan_history', JSON.stringify(history.slice(0, 100))); // Keep last 100
  }

  // Dark Web Monitoring
  async checkDarkWebBreaches(email: string, gstNumber: string): Promise<any[]> {
    // Simulate dark web monitoring
    const breaches = [
      {
        id: '1',
        type: 'email',
        value: email,
        source: 'Data breach - TechCorp 2024',
        dateFound: new Date().toISOString(),
        severity: 'high',
        status: 'active',
      },
      {
        id: '2',
        type: 'gst',
        value: gstNumber.substring(0, 6) + '***' + gstNumber.substring(9),
        source: 'Business database leak',
        dateFound: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'medium',
        status: 'resolved',
      }
    ];

    // Store breach data
    await AsyncStorage.setItem('dark_web_breaches', JSON.stringify(breaches));
    
    return breaches;
  }

  // Cyber Health Calculation
  async calculateCyberHealth(): Promise<number> {
    try {
      const alerts = await AsyncStorage.getItem('security_alerts');
      const scanHistory = await AsyncStorage.getItem('scan_history');
      
      const alertsData = alerts ? JSON.parse(alerts) : [];
      const scanData = scanHistory ? JSON.parse(scanHistory) : [];

      let healthScore = 100;

      // Reduce score based on active threats
      const activeThreats = alertsData.filter((alert: any) => alert.status === 'active');
      healthScore -= activeThreats.length * 10;

      // Reduce score based on recent scan results
      const recentScans = scanData.slice(0, 5);
      const avgThreats = recentScans.reduce((sum: number, scan: any) => sum + scan.threatsFound, 0) / Math.max(recentScans.length, 1);
      healthScore -= avgThreats * 5;

      return Math.max(Math.min(healthScore, 100), 0);
    } catch (error) {
      return 85; // Default score
    }
  }

  // Get notification history for email analysis
  async getNotificationHistory(): Promise<EmailAnalysis[]> {
    try {
      const history = await AsyncStorage.getItem('email_notifications');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  }

  async addEmailNotification(emailData: EmailAnalysis): Promise<void> {
    try {
      const existing = await this.getNotificationHistory();
      existing.unshift(emailData);
      await AsyncStorage.setItem('email_notifications', JSON.stringify(existing.slice(0, 100)));
    } catch (error) {
      console.error('Failed to save email notification:', error);
    }
  }
}

export default SecurityService;
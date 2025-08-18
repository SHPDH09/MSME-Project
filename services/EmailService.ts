import * as MailComposer from 'expo-mail-composer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  companyName: string;
  gstNumber: string;
  language: string;
  isVerified: boolean;
  createdAt: string;
}

interface OTPData {
  otp: string;
  email: string;
  timestamp: number;
  expires: number;
  attempts: number;
}

class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Register new user
  async registerUser(userData: Omit<User, 'id' | 'isVerified' | 'createdAt'>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const userExists = await this.checkUserExists(userData.email);
      if (userExists) {
        return { success: false, message: 'User already exists with this email' };
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      const users = await this.getAllUsers();
      users.push(newUser);
      await AsyncStorage.setItem('registered_users', JSON.stringify(users));

      return { success: true, message: 'User registered successfully', user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Get all users
  private async getAllUsers(): Promise<User[]> {
    try {
      const usersData = await AsyncStorage.getItem('registered_users');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      return user ? user.password === password : false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Send OTP via email
  async sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpData: OTPData = {
        otp,
        email,
        timestamp: Date.now(),
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
      };

      // Store OTP
      await AsyncStorage.setItem(`otp_${email}`, JSON.stringify(otpData));

      // Check if mail composer is available
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        // Send actual email
        const emailBody = `
          <h2>DigiRakshak - Email Verification</h2>
          <p>Your OTP for DigiRakshak login is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <br>
          <p>Stay secure with DigiRakshak!</p>
          <p>Team DigiRakshak</p>
        `;

        await MailComposer.composeAsync({
          recipients: [email],
          subject: 'DigiRakshak - Email Verification OTP',
          body: emailBody,
          isHtml: true,
        });

        return {
          success: true,
          message: `OTP sent to ${email}. Please check your email and enter the 6-digit code.`
        };
      } else {
        // Fallback: Show OTP in alert for testing
        console.log(`OTP for ${email}: ${otp}`);
        return {
          success: true,
          message: `OTP generated: ${otp} (Check console for testing). In production, this will be sent via email.`
        };
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please check your email settings and try again.'
      };
    }
  }

  // Verify OTP
  async verifyEmailOTP(email: string, enteredOTP: string): Promise<{ success: boolean; message: string }> {
    try {
      const storedData = await AsyncStorage.getItem(`otp_${email}`);
      if (!storedData) {
        return { success: false, message: 'OTP not found or expired. Please request a new OTP.' };
      }

      const otpData: OTPData = JSON.parse(storedData);
      
      // Check expiration
      if (Date.now() > otpData.expires) {
        await AsyncStorage.removeItem(`otp_${email}`);
        return { success: false, message: 'OTP has expired. Please request a new OTP.' };
      }

      // Check attempts
      if (otpData.attempts >= 3) {
        await AsyncStorage.removeItem(`otp_${email}`);
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }

      // Verify OTP
      if (otpData.otp === enteredOTP) {
        await AsyncStorage.removeItem(`otp_${email}`);
        
        // Mark user as verified
        await this.markUserAsVerified(email);
        
        return { success: true, message: 'Email verified successfully!' };
      } else {
        // Increment attempts
        otpData.attempts += 1;
        await AsyncStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
        
        const remainingAttempts = 3 - otpData.attempts;
        return { 
          success: false, 
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'OTP verification failed. Please try again.' };
    }
  }

  // Mark user as verified
  private async markUserAsVerified(email: string): Promise<void> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].isVerified = true;
        await AsyncStorage.setItem('registered_users', JSON.stringify(users));
      }
    } catch (error) {
      console.error('Error marking user as verified:', error);
    }
  }

  // Login user
  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'User not found. Please register first.' };
      }

      if (user.password !== password) {
        return { success: false, message: 'Invalid password. Please try again.' };
      }

      if (!user.isVerified) {
        return { success: false, message: 'Email not verified. Please verify your email first.' };
      }

      // Store current user session
      await AsyncStorage.setItem('current_user', JSON.stringify(user));

      return { success: true, message: 'Login successful!', user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout user
  async logoutUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('current_user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Remove existing OTP
      await AsyncStorage.removeItem(`otp_${email}`);
      
      // Send new OTP
      return await this.sendEmailOTP(email);
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'Failed to resend OTP. Please try again.' };
    }
  }
}

export default EmailService;
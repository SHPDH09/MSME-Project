import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

interface VoiceAlert {
  message: string;
  language: string;
  severity: 'high' | 'medium' | 'low';
}

class VoiceAlertService {
  private static instance: VoiceAlertService;
  private isPlaying = false;

  static getInstance(): VoiceAlertService {
    if (!VoiceAlertService.instance) {
      VoiceAlertService.instance = new VoiceAlertService();
    }
    return VoiceAlertService.instance;
  }

  async playVoiceAlert(alert: VoiceAlert): Promise<void> {
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;

      // Get localized message
      const localizedMessage = this.getLocalizedMessage(alert.message, alert.language);
      
      // Configure speech options based on severity
      const speechOptions = {
        language: this.getLanguageCode(alert.language),
        pitch: alert.severity === 'high' ? 1.2 : 1.0,
        rate: alert.severity === 'high' ? 0.8 : 1.0,
        volume: 1.0,
      };

      // Play alert sound first
      await this.playAlertSound(alert.severity);
      
      // Then speak the message
      await Speech.speak(localizedMessage, speechOptions);

    } catch (error) {
      console.error('Voice alert error:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  private async playAlertSound(severity: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        severity === 'high' 
          ? require('../assets/sounds/high-alert.mp3')
          : require('../assets/sounds/medium-alert.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      
      // Unload sound after playing
      setTimeout(() => {
        sound.unloadAsync();
      }, 3000);
    } catch (error) {
      console.log('Alert sound not available, using speech only');
    }
  }

  private getLocalizedMessage(message: string, language: string): string {
    const translations: { [key: string]: { [key: string]: string } } = {
      'Phishing Email Detected': {
        'Hindi': 'फिशिंग ईमेल का पता चला है। सावधान रहें।',
        'English': 'Phishing email detected. Be careful.',
        'Marathi': 'फिशिंग ईमेल आढळले आहे. सावध राहा.',
        'Gujarati': 'ફિશિંગ ઈમેલ મળ્યો છે. સાવચેત રહો.',
      },
      'Malware Detected': {
        'Hindi': 'मैलवेयर का पता चला है। तुरंत कार्रवाई करें।',
        'English': 'Malware detected. Take immediate action.',
        'Marathi': 'मालवेअर आढळले आहे. तातडीने कारवाई करा.',
        'Gujarati': 'મેલવેર મળ્યો છે. તાત્કાલિક પગલાં લો.',
      },
      'Suspicious Website': {
        'Hindi': 'संदिग्ध वेबसाइट। इस साइट पर जानकारी न दें।',
        'English': 'Suspicious website. Do not enter information on this site.',
        'Marathi': 'संशयास्पद वेबसाइट. या साइटवर माहिती देऊ नका.',
        'Gujarati': 'શંકાસ્પદ વેબસાઇટ. આ સાઇટ પર માહિતી આપશો નહીં.',
      }
    };

    const messageTranslations = translations[message];
    if (messageTranslations && messageTranslations[language]) {
      return messageTranslations[language];
    }

    return message; // Fallback to original message
  }

  private getLanguageCode(language: string): string {
    const languageCodes: { [key: string]: string } = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Marathi': 'mr-IN',
      'Gujarati': 'gu-IN',
      'Bengali': 'bn-IN',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Kannada': 'kn-IN',
      'Malayalam': 'ml-IN',
      'Punjabi': 'pa-IN',
    };

    return languageCodes[language] || 'en-US';
  }

  async stopVoiceAlert(): Promise<void> {
    try {
      await Speech.stop();
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping voice alert:', error);
    }
  }
}

export default VoiceAlertService;
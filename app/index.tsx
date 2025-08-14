import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo appearance
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800 }),
      withTiming(1, { duration: 300 })
    );
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Animate text appearance
    textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));

    // Navigate to auth after animation
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  const taglineAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value,
    };
  });

  return (
    <LinearGradient 
      colors={['#1E3A8A', '#2563EB', '#3B82F6']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.shieldContainer}>
            <Shield size={80} color="#ffffff" strokeWidth={2} />
            <View style={styles.innerShield}>
              <Text style={styles.logoText}>D</Text>
            </View>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.appName}>DigiRakshak</Text>
          <Text style={styles.subtitle}>AI Cyber Police</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
          <Text style={styles.tagline}>"Protecting MSMEs in their own language"</Text>
          <Text style={styles.taglineHindi}>
            "अपनी भाषा में MSME की सुरक्षा"
          </Text>
        </Animated.View>

        {/* Digital Shield Graphic */}
        <View style={styles.graphicContainer}>
          <View style={styles.digitalShield}>
            <View style={[styles.shieldLayer, styles.shieldLayer1]} />
            <View style={[styles.shieldLayer, styles.shieldLayer2]} />
            <View style={[styles.shieldLayer, styles.shieldLayer3]} />
          </View>
        </View>
      </View>

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.patternDot, 
              {
                left: Math.random() * width,
                top: Math.random() * height,
                animationDelay: `${Math.random() * 3}s`,
              }
            ]} 
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerShield: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    color: '#BFDBFE',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  taglineContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  taglineHindi: {
    fontSize: 14,
    color: '#C7D2FE',
    textAlign: 'center',
    fontWeight: '500',
  },
  graphicContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  digitalShield: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldLayer: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
  },
  shieldLayer1: {
    width: 120,
    height: 120,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shieldLayer2: {
    width: 90,
    height: 90,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shieldLayer3: {
    width: 60,
    height: 60,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
});
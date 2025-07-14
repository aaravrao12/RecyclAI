// Professional, Dynamic, and Responsive Authentication Screen
// FIXED VERSION - Compilation errors resolved
// Optimized for all device sizes (web and mobile)

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from '../../firebase';

// Responsive utilities
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Responsive breakpoints
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
};

const getDeviceType = () => {
  if (screenWidth < breakpoints.mobile) return 'mobile';
  if (screenWidth < breakpoints.tablet) return 'tablet';
  if (screenWidth < breakpoints.desktop) return 'desktop';
  return 'large-desktop';
};

const deviceType = getDeviceType();
const isMobile = deviceType === 'mobile';
const isTablet = deviceType === 'tablet';
const isDesktop = deviceType === 'desktop' || deviceType === 'large-desktop';

// Responsive values
const getResponsiveValue = (mobile: number, tablet: number, desktop: number) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

// Enhanced particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  direction: number;
  color: string;
  anim: Animated.Value;
  rotationAnim: Animated.Value;
}

export default function ProfessionalAuthScreen() {
  const router = useRouter();
  
  // State management
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  // Error state management
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    general: '',
    forgotPassword: ''
  });
  
  // Enhanced animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const forgotPasswordAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced particle system
  const particleCount = getResponsiveValue(8, 15, 25);
  const [particles] = useState<Particle[]>(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: getResponsiveValue(2, 3, 4) + Math.random() * 3,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
      color: ['#667eea', '#764ba2', '#f093fb', '#f5576c'][Math.floor(Math.random() * 4)],
      anim: new Animated.Value(0),
      rotationAnim: new Animated.Value(0)
    }))
  );

  // Keyboard event listeners for mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
      });
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });

      return () => {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      };
    }
  }, []);

  // Enhanced initialization animations
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
      
      // Staggered entrance animations
      Animated.stagger(100, [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        })
      ]).start();

      startAdvancedAnimations();
      
      // Enhanced particle animations
      particles.forEach((particle, index) => {
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 1500 + Math.random() * 1000,
          delay: Math.random() * 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        
        startParticleAnimation(particle);
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
      // Cleanup animations
      [fadeAnim, scaleAnim, slideAnim, toggleAnim, pulseAnim, 
       shimmerAnim, floatAnim, forgotPasswordAnim, glowAnim]
        .forEach(anim => anim.stopAnimation());
      particles.forEach(particle => {
        particle.anim.stopAnimation();
        particle.rotationAnim.stopAnimation();
      });
    };
  }, []);

  // Advanced animation functions
  const startAdvancedAnimations = () => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const startParticleAnimation = (particle: Particle) => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(particle.anim, {
          toValue: 0.3,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(particle.rotationAnim, {
        toValue: 1,
        duration: 10000 + Math.random() * 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // Enhanced validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateName = (name: string) => {
    if (!isLogin && !name.trim()) {
      return 'Name is required';
    }
    if (!isLogin && name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return '';
  };

  // Enhanced input handlers with haptic feedback
  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailError = validateEmail(text);
    setErrors(prev => ({ ...prev, email: emailError, general: '' }));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const passwordError = validatePassword(text);
    setErrors(prev => ({ ...prev, password: passwordError, general: '' }));
  };

  const handleNameChange = (text: string) => {
    setName(text);
    const nameError = validateName(text);
    setErrors(prev => ({ ...prev, name: nameError, general: '' }));
  };

  const handleForgotPasswordEmailChange = (text: string) => {
    setForgotPasswordEmail(text);
    const emailError = validateEmail(text);
    setErrors(prev => ({ ...prev, forgotPassword: emailError ? 'Please enter a valid email address' : '' }));
  };

  // Enhanced mode toggle with smooth animations
  const toggleMode = () => {
    if (!isWeb && Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    
    Animated.parallel([
      Animated.timing(toggleAnim, {
        toValue: isLogin ? 1 : 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
    
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setErrors({ name: '', email: '', password: '', general: '', forgotPassword: '' });
    setShowForgotPassword(false);
  };

  // Enhanced forgot password modal
  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setForgotPasswordEmail('');
    setErrors(prev => ({ ...prev, forgotPassword: '' }));
    
    Animated.spring(forgotPasswordAnim, {
      toValue: showForgotPassword ? 0 : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // Enhanced forgot password functionality
  const handleForgotPassword = async () => {
    const emailError = validateEmail(forgotPasswordEmail);
    if (emailError) {
      setErrors(prev => ({ ...prev, forgotPassword: emailError }));
      return;
    }

    setForgotPasswordLoading(true);
    setErrors(prev => ({ ...prev, forgotPassword: '' }));

    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail.trim());
      
      if (isWeb) {
        alert('If an account with that email exists, a password reset link has been sent to your inbox.');
      } else {
        Alert.alert(
          'Email Sent',
          'If an account with that email exists, a password reset link has been sent to your inbox.',
          [{ text: 'OK', onPress: () => toggleForgotPassword() }]
        );
      }
      
      toggleForgotPassword();
      
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = 'An error occurred. Please try again.';
            break;
        }
      }
      
      setErrors(prev => ({ ...prev, forgotPassword: errorMessage }));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Enhanced authentication handler
const handleAuth = async () => {
  setErrors({ name: '', email: '', password: '', general: '', forgotPassword: '' });

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const nameError = validateName(name);

  if (emailError || passwordError || nameError) {
    setErrors({
      email: emailError,
      password: passwordError,
      name: nameError,
      general: 'Please fix the errors below',
      forgotPassword: ''
    });
    return;
  }

  setIsLoading(true);

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/account');
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Set display name in Firebase Authentication
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });

      // ✅ Store user data in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp()
      });

      router.push('/account');
    }
  } catch (error: any) {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Email not registered, please sign up.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again, or sign up if you don\'t have an account.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        default:
          errorMessage = `Authentication error: ${error.code}. Please try again.`;
          break;
      }
    }

    setErrors(prev => ({ ...prev, general: errorMessage }));
  } finally {
    setIsLoading(false);
  }
};


  // Enhanced Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({ name: '', email: '', password: '', general: '', forgotPassword: '' });
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/account');
    } catch (error: any) {
      let errorMessage = "An error occurred during Google sign-in.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Google sign-in popup closed.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Google sign-in cancelled.";
      } else {
        console.error("Google Sign-In Error:", error);
      }
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced calculated values
  const logoTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, getResponsiveValue(-10, -15, -20)]
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth]
  });

  const toggleBackgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(102, 126, 234, 0.15)', 'rgba(240, 147, 251, 0.15)']
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3]
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0f0f23" 
        translucent={false}
      />
      
      {/* Enhanced Background with Static Gradient */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#0f0f23', '#1a1a3e', '#2d2d5f']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Enhanced Particle System */}
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.enhancedParticle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, particle.opacity]
              }),
              transform: [
                {
                  translateY: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -particle.speed * getResponsiveValue(80, 120, 150)]
                  })
                },
                {
                  rotate: particle.rotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                },
                {
                  scale: particle.anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.2, 0.8]
                  })
                }
              ]
            }
          ]}
        />
      ))}

      {/* Enhanced Shimmer Effect */}
      <Animated.View
        style={[
          styles.enhancedShimmer,
          {
            opacity: glowOpacity,
            transform: [{ translateX: shimmerTranslateX }]
          }
        ]}
      />

      {/* Enhanced Forgot Password Modal */}
      {showForgotPassword && (
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: forgotPasswordAnim,
            }
          ]}
        >
          <Animated.View
            style={[
              styles.enhancedModalContainer,
              {
                transform: [
                  {
                    scale: forgotPasswordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1]
                    })
                  },
                  {
                    translateY: forgotPasswordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.enhancedModalTitle}>Reset Password</Text>
              <TouchableOpacity
                onPress={toggleForgotPassword}
                style={styles.enhancedModalCloseButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.enhancedModalDescription}>
              Enter your email address and we'll send you a secure link to reset your password.
            </Text>
            
            {errors.forgotPassword ? (
              <View style={styles.enhancedErrorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{errors.forgotPassword}</Text>
              </View>
            ) : null}
            
            <View style={styles.modalInputContainer}>
              <View style={styles.enhancedInputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#8892b0" style={styles.inputIcon} />
                <TextInput
                  style={styles.enhancedTextInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#8892b0"
                  value={forgotPasswordEmail}
                  onChangeText={handleForgotPasswordEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.enhancedModalButton, forgotPasswordLoading && styles.modalButtonDisabled]}
              onPress={handleForgotPassword}
              disabled={forgotPasswordLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.modalButtonGradient}
              >
                {forgotPasswordLoading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View
                      style={{
                        transform: [{
                          rotate: pulseAnim.interpolate({
                            inputRange: [1, 1.08],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }}
                    >
                      <MaterialCommunityIcons name="loading" size={20} color="#ffffff" />
                    </Animated.View>
                    <Text style={styles.modalButtonText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalButtonText}>Send Reset Email</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardVisible ? 50 : getResponsiveValue(40, 60, 80) }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Enhanced Header Section */}
        <Animated.View
          style={[
            styles.enhancedHeader,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: logoTranslateY }
              ]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.enhancedLogoContainer,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons 
                name="recycle" 
                size={getResponsiveValue(35, 40, 45)} 
                color="#ffffff" 
              />
            </LinearGradient>
            
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.logoGlow,
                {
                  opacity: glowOpacity,
                }
              ]}
            />
          </Animated.View>
          
          <Text style={styles.enhancedTitle}>RecyclAI</Text>
          <Text style={styles.enhancedSubtitle}>
            {isLogin ? 'Welcome back to the future' : 'Join the green revolution'}
          </Text>
        </Animated.View>

        {/* Enhanced Mode Toggle */}
        <Animated.View
          style={[
            styles.enhancedToggleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.enhancedToggleBackground,
              { backgroundColor: toggleBackgroundColor }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enhancedToggleButton,
                isLogin && styles.enhancedToggleButtonActive
              ]}
              onPress={toggleMode}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.enhancedToggleText,
                isLogin && styles.enhancedToggleTextActive
              ]}>
                Sign In
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.enhancedToggleButton,
                !isLogin && styles.enhancedToggleButtonActive
              ]}
              onPress={toggleMode}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.enhancedToggleText,
                !isLogin && styles.enhancedToggleTextActive
              ]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Form Section */}
        <Animated.View
          style={[
            styles.enhancedFormContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Enhanced General Error Message */}
          {errors.general ? (
            <View style={styles.enhancedErrorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ff6b6b" />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Enhanced Name Input (Sign Up only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <View style={[
                styles.enhancedInputWrapper,
                errors.name ? styles.inputWrapperError : null
              ]}>
                <Ionicons name="person-outline" size={20} color="#8892b0" style={styles.inputIcon} />
                <TextInput
                  style={styles.enhancedTextInput}
                  placeholder="Full Name"
                  placeholderTextColor="#8892b0"
                  value={name}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.name ? (
                <Text style={styles.fieldErrorText}>{errors.name}</Text>
              ) : null}
            </View>
          )}

          {/* Enhanced Email Input */}
          <View style={styles.inputContainer}>
            <View style={[
              styles.enhancedInputWrapper,
              errors.email ? styles.inputWrapperError : null
            ]}>
              <Ionicons name="mail-outline" size={20} color="#8892b0" style={styles.inputIcon} />
              <TextInput
                style={styles.enhancedTextInput}
                placeholder="Email Address"
                placeholderTextColor="#8892b0"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email ? (
              <Text style={styles.fieldErrorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Enhanced Password Input */}
          <View style={styles.inputContainer}>
            <View style={[
              styles.enhancedInputWrapper,
              errors.password ? styles.inputWrapperError : null
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8892b0" style={styles.inputIcon} />
              <TextInput
                style={styles.enhancedTextInput}
                placeholder="Password"
                placeholderTextColor="#8892b0"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.enhancedEyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#8892b0" 
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.fieldErrorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Enhanced Forgot Password Link (Sign In only) */}
          {isLogin && (
            <TouchableOpacity
              style={styles.enhancedForgotPasswordLink}
              onPress={toggleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.enhancedForgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Enhanced Submit Button */}
          <TouchableOpacity
            style={[styles.enhancedSubmitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLogin ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
              style={styles.enhancedSubmitGradient}
            >
              {isLoading ? (
                <Animated.View
                  style={[
                    styles.loadingContainer,
                    {
                      transform: [{ scale: pulseAnim }]
                    }
                  ]}
                >
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: pulseAnim.interpolate({
                          inputRange: [1, 1.08],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }}
                  >
                    <MaterialCommunityIcons name="loading" size={24} color="#ffffff" />
                  </Animated.View>
                  <Text style={styles.enhancedSubmitText}>Processing...</Text>
                </Animated.View>
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.enhancedSubmitText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                  <Ionicons 
                    name={isLogin ? "log-in-outline" : "person-add-outline"} 
                    size={20} 
                    color="#ffffff" 
                    style={{ marginLeft: 8 }}
                  />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Enhanced Separator */}
          <View style={styles.enhancedSeparatorContainer}>
            <View style={styles.enhancedSeparatorLine} />
            <Text style={styles.enhancedSeparatorText}>OR</Text>
            <View style={styles.enhancedSeparatorLine} />
          </View>

          {/* Enhanced Social Login Buttons */}
          <TouchableOpacity
            style={styles.enhancedSocialButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
              <Text style={styles.enhancedSocialButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Enhanced Responsive Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(30, 50, 60),
    paddingHorizontal: getResponsiveValue(20, 30, 40),
    minHeight: screenHeight,
  },
  
  // Enhanced Header Styles
  enhancedHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveValue(25, 35, 45),
    position: 'relative',
    width: '100%',
  },
  enhancedLogoContainer: {
    width: getResponsiveValue(70, 80, 90),
    height: getResponsiveValue(70, 80, 90),
    borderRadius: getResponsiveValue(35, 40, 45),
    overflow: 'hidden',
    marginBottom: getResponsiveValue(12, 15, 18),
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    position: 'relative',
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: getResponsiveValue(45, 50, 55),
    backgroundColor: '#667eea',
    zIndex: -1,
  },
  enhancedTitle: {
    fontSize: getResponsiveValue(32, 38, 44),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  enhancedSubtitle: {
    fontSize: getResponsiveValue(16, 18, 20),
    color: '#a0a0c0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: getResponsiveValue(22, 24, 26),
    fontWeight: '400',
  },
  
  // Enhanced Toggle Styles
  enhancedToggleContainer: {
    width: '100%',
    maxWidth: getResponsiveValue(350, 400, 450),
    marginBottom: getResponsiveValue(25, 30, 35),
    alignItems: 'center',
  },
  enhancedToggleBackground: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 30,
    padding: 6,
    width: '100%',
    justifyContent: 'space-around',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  enhancedToggleButton: {
    flex: 1,
    paddingVertical: getResponsiveValue(12, 14, 16),
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  enhancedToggleButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  enhancedToggleText: {
    fontSize: getResponsiveValue(15, 16, 17),
    fontWeight: '600',
    color: '#a0a0c0',
  },
  enhancedToggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Enhanced Form Styles
  enhancedFormContainer: {
    width: '100%',
    maxWidth: getResponsiveValue(350, 400, 450),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: getResponsiveValue(16, 20, 24),
    padding: getResponsiveValue(20, 25, 30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  
  // Enhanced Error Styles
  enhancedErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 10,
    padding: getResponsiveValue(12, 14, 16),
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: getResponsiveValue(13, 14, 15),
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  fieldErrorText: {
    color: '#ff6b6b',
    fontSize: getResponsiveValue(11, 12, 13),
    marginTop: 6,
    marginLeft: 5,
    fontWeight: '500',
  },
  
  // Enhanced Input Styles
  inputContainer: {
    marginBottom: getResponsiveValue(18, 20, 22),
  },
  enhancedInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: getResponsiveValue(10, 12, 14),
    paddingHorizontal: getResponsiveValue(12, 15, 18),
    height: getResponsiveValue(50, 55, 60),
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: '#ff6b6b',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  inputIcon: {
    marginRight: getResponsiveValue(10, 12, 14),
  },
  enhancedTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: getResponsiveValue(15, 16, 17),
    paddingVertical: 0,
    fontWeight: '400',
  },
  enhancedEyeIcon: {
    padding: getResponsiveValue(6, 8, 10),
    borderRadius: 20,
  },
  
  // Enhanced Forgot Password Styles
  enhancedForgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  enhancedForgotPasswordText: {
    color: '#667eea',
    fontSize: getResponsiveValue(13, 14, 15),
    fontWeight: '600',
  },
  
  // Enhanced Submit Button Styles
  enhancedSubmitButton: {
    width: '100%',
    height: getResponsiveValue(50, 55, 60),
    borderRadius: getResponsiveValue(12, 15, 18),
    marginTop: 10,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  enhancedSubmitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enhancedSubmitText: {
    fontSize: getResponsiveValue(16, 18, 20),
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Enhanced Separator Styles
  enhancedSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: getResponsiveValue(20, 25, 30),
  },
  enhancedSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  enhancedSeparatorText: {
    color: '#8892b0',
    fontSize: getResponsiveValue(13, 14, 15),
    fontWeight: '600',
    marginHorizontal: getResponsiveValue(12, 15, 18),
    letterSpacing: 0.5,
  },
  
  // Enhanced Social Button Styles
  enhancedSocialButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: getResponsiveValue(10, 12, 14),
    paddingVertical: getResponsiveValue(14, 16, 18),
    paddingHorizontal: getResponsiveValue(16, 20, 24),
    marginBottom: getResponsiveValue(10, 12, 14),
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: getResponsiveValue(12, 15, 18),
  },
  enhancedSocialButtonText: {
    color: '#ffffff',
    fontSize: getResponsiveValue(15, 16, 17),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Enhanced Particle Styles
  enhancedParticle: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Enhanced Shimmer Styles
  enhancedShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ skewX: '-20deg' }],
  },
  
  // Enhanced Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  enhancedModalContainer: {
    width: '90%',
    maxWidth: getResponsiveValue(350, 400, 450),
    backgroundColor: 'rgba(26, 26, 62, 0.95)',
    borderRadius: getResponsiveValue(16, 20, 24),
    padding: getResponsiveValue(20, 25, 30),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(15, 18, 20),
  },
  enhancedModalTitle: {
    fontSize: getResponsiveValue(20, 22, 24),
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  enhancedModalCloseButton: {
    padding: getResponsiveValue(6, 8, 10),
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  enhancedModalDescription: {
    color: '#a0a0c0',
    fontSize: getResponsiveValue(15, 16, 17),
    lineHeight: getResponsiveValue(20, 22, 24),
    marginBottom: getResponsiveValue(18, 20, 22),
    fontWeight: '400',
  },
  modalInputContainer: {
    marginBottom: getResponsiveValue(18, 20, 22),
  },
  enhancedModalButton: {
    width: '100%',
    height: getResponsiveValue(48, 52, 56),
    borderRadius: getResponsiveValue(10, 12, 14),
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: getResponsiveValue(15, 16, 17),
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 5,
    letterSpacing: 0.3,
  },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    useColorScheme as _useColorScheme,
    Alert,
    Animated,
    Dimensions,
    Easing,
    Modal,
    PixelRatio,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

// Firebase imports for user authentication
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Enhanced types for better TypeScript support
type IconName =
  | 'recycle'
  | 'leaf'
  | 'earth'
  | 'trophy'
  | 'chart-line'
  | 'star'
  | 'lightning-bolt'
  | 'trending-up'
  | 'clock-fast'
  | 'target'
  | 'flash'
  | 'weather-sunny'
  | 'weather-night'
  | 'coin'
  | 'fire'
  | 'water'
  | 'tree'
  | 'factory'
  | 'car'
  | 'home'
  | 'calendar'
  | 'medal'
  | 'shield-check'
  | 'heart'
  | 'brain'
  | 'rocket-launch'
  | 'sparkles'
  | 'eye'
  | 'account-group'
  | 'bottle-soda'
  | 'newspaper-variant'
  | 'gift'
  | 'arrow-left';

interface StatCard {
  icon: IconName;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  anim: Animated.Value;
  delay: number;
  color: [string, string, ...string[]];
  category: 'impact' | 'activity' | 'achievement' | 'environmental';
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  direction: number;
  anim: Animated.Value;
  color: string;
  type: 'circle' | 'star' | 'diamond';
}

interface MenuItem {
  title: string;
  route: string;
  icon: string;
  description: string;
}

// Enhanced responsive system
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const isWeb = Platform.OS === 'web';

// Enhanced breakpoint system
const breakpoints = {
  xs: 0,      // Extra small devices (phones, 0px and up)
  sm: 576,    // Small devices (landscape phones, 576px and up)
  md: 768,    // Medium devices (tablets, 768px and up)
  lg: 992,    // Large devices (desktops, 992px and up)
  xl: 1200,   // Extra large devices (large desktops, 1200px and up)
  xxl: 1400   // Extra extra large devices (larger desktops, 1400px and up)
};

const getDeviceType = () => {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints.xxl) return 'xl';
  return 'xxl';
};

const deviceType = getDeviceType();
const isMobile = deviceType === 'xs' || deviceType === 'sm';
const isTablet = deviceType === 'md';
const isDesktop = deviceType === 'lg' || deviceType === 'xl' || deviceType === 'xxl';

// Performance-optimized particle count
const PARTICLE_COUNT = isMobile ? 12 : isTablet ? 20 : 35;

// Enhanced color scheme hook with system detection
const useColorScheme = () => {
  const systemColorScheme = _useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
};

// Helper function to extract first name only
const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

// Function to fetch user points from Firebase
const fetchUserPoints = async (userId: string): Promise<number> => {
  try {
    if (!db) {
      console.error("Firestore database is not initialized.");
      return 0;
    }
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.points || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }
};

// Calculate environmental impact statistics based on user points
const calculateStats = (points: number) => {
  const itemsCaptured = Math.floor(points / 5);
  const co2Diverted = (itemsCaptured * 0.5).toFixed(1); // Estimate 0.5 kg CO2 per item
  const treesEquivalent = (points * 0.00025).toFixed(3); // Updated formula
  const energySaved = (points * 0.1).toFixed(1); // Updated formula
  const waterSaved = (points * 2).toFixed(1); // Updated formula
  const wasteReduced = parseFloat((points * 0.008).toFixed(3)); // Updated formula
  
  return {
    itemsCaptured,
    co2Diverted,
    treesEquivalent,
    energySaved,
    waterSaved,
    wasteReduced,
    points
  };
};

// Professional Hamburger Menu Component
const HamburgerMenu = ({
  isDark,
  router
}: {
  isDark: boolean;
  router: any;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const menuItems: MenuItem[] = [
    {
      title: 'Home',
      route: '/(tabs)/account',
      icon: 'home',
      description: 'Return to main dashboard'
    },
    {
      title: 'Image Capture',
      route: '/(tabs)/next_page',
      icon: 'camera',
      description: 'Capture and analyze waste items'
    },
    {
      title: 'Learn More',
      route: '/(tabs)/learn_more',
      icon: 'book-open-page-variant',
      description: 'Discover recycling tips and guides'
    },
    {
      title: 'Back to Login',
      route: '/',
      icon: 'login',
      description: 'Return to login screen'
    },
    {
      title: 'About the Developer',
      route: '/(tabs)/developer',
      icon: 'face-man-profile',
      description: 'Learn more about the developer of this app, Aarav Rao'
    }
  ];

  const toggleMenu = useCallback(() => {
    const toValue = isMenuOpen ? 0 : 1;
    const slideToValue = isMenuOpen ? -300 : 0;

    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }

    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: slideToValue,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, menuAnim, overlayAnim, slideAnim]);

  const handleMenuItemPress = useCallback((route: string) => {
    toggleMenu();
    setTimeout(() => {
      router.push(route);
    }, 150);
  }, [router, toggleMenu]);

  const hamburgerRotation = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity
        style={[
          styles.hamburgerButton,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{ rotate: hamburgerRotation }],
          }}
        >
          <MaterialCommunityIcons
            name="menu"
            size={24}
            color={isDark ? '#ffffff' : '#2c3e50'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        {/* Overlay */}
        <Animated.View
          style={[
            styles.menuOverlay,
            {
              backgroundColor: `rgba(0, 0, 0, ${overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              })})`,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Menu Content */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
              transform: [{ translateX: slideAnim }],
              shadowColor: isDark ? '#000' : '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 10,
              elevation: 10,
            }
          ]}
        >
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <Text style={[
              styles.menuTitle,
              { color: isDark ? '#ffffff' : '#2c3e50' }
            ]}>
              Navigation
            </Text>
            <TouchableOpacity
              onPress={toggleMenu}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDark ? '#ffffff' : '#2c3e50'}
              />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                    borderBottomColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                  }
                ]}
                onPress={() => handleMenuItemPress(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={isDark ? '#4ecca3' : '#667eea'}
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuItemTitle,
                    { color: isDark ? '#ffffff' : '#2c3e50' }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.menuItemDescription,
                    { color: isDark ? '#bdc3c7' : '#5a6c7d' }
                  ]}>
                    {item.description}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={isDark ? '#7f8c8d' : '#95a5a6'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Menu Footer */}
          <View style={styles.menuFooter}>
            <Text style={[
              styles.menuFooterText,
              { color: isDark ? '#7f8c8d' : '#95a5a6' }
            ]}>
              RecyclAI • v1.0
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

// Enhanced Welcome Section Component without Points Display
const WelcomeSection = ({
  userName,
  isLoadingUser,
  isDark,
  isMobile,
  isTablet,
}: {
  userName: string;
  isLoadingUser: boolean;
  isDark: boolean;
  isMobile: boolean;
  isTablet: boolean;
}) => {
  // Animation values for enhanced effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get only the first name
  const firstName = getFirstName(userName);

  // Enhanced animation sequence
  useEffect(() => {
    if (firstName && !isLoadingUser) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      scaleAnim.setValue(0.8);

      // Start entrance animations
      const entranceAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]);

      entranceAnimation.start();

      return () => {
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
      };
    }
  }, [firstName, isLoadingUser]);

  if (!firstName || isLoadingUser) {
    return null;
  }

  return (
    <View style={styles.welcomeSectionContainer}>
      <Animated.Text
        style={[
          styles.welcomeTextLeft,
          {
            fontSize: isMobile ? 18 : isTablet ? 20 : 22,
            color: isDark ? '#ffffff' : '#2c3e50',
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          }
        ]}
      >
        {firstName}'s Stats
      </Animated.Text>
    </View>
  );
};

export default function StatsScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';

  // User state for welcome message and points
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Enhanced animation values with better performance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Calculate user statistics
  const userStats = calculateStats(userPoints);

  // Enhanced stat cards with better data - using useMemo to recalculate when userPoints changes
  const statCards = useMemo<StatCard[]>(() => [
    {
      icon: 'recycle',
      title: 'Items Captured',
      value: userStats.itemsCaptured.toString(),
      subtitle: 'Recycled Items',
      description: 'Total items you\'ve successfully identified and recycled',
      anim: new Animated.Value(0),
      delay: 200,
      color: ['#2ecc71', '#27ae60', '#16a085'],
      category: 'activity'
    },
    {
      icon: 'leaf',
      title: 'CO₂ Diverted',
      value: `${userStats.co2Diverted} kg`,
      subtitle: 'Carbon Footprint Reduced',
      description: 'Estimated CO₂ emissions prevented through your recycling efforts',
      anim: new Animated.Value(0),
      delay: 300,
      color: ['#4ecca3', '#44a08d', '#2ecc71'],
      category: 'environmental'
    },
    {
      icon: 'tree',
      title: 'Trees Equivalent',
      value: userStats.treesEquivalent.toString(),
      subtitle: 'Trees Saved',
      description: 'Environmental impact equivalent to planting this many trees',
      anim: new Animated.Value(0),
      delay: 400,
      color: ['#27ae60', '#2ecc71', '#16a085'],
      category: 'environmental'
    },
    {
      icon: 'lightning-bolt',
      title: 'Energy Saved',
      value: `${userStats.energySaved} kWh`,
      subtitle: 'Power Conserved',
      description: 'Energy saved through recycling instead of producing new materials',
      anim: new Animated.Value(0),
      delay: 500,
      color: ['#f39c12', '#e67e22', '#d35400'],
      category: 'impact'
    },
    {
      icon: 'water',
      title: 'Water Saved',
      value: `${userStats.waterSaved} L`,
      subtitle: 'Water Conserved',
      description: 'Water saved by recycling materials instead of manufacturing new ones',
      anim: new Animated.Value(0),
      delay: 600,
      color: ['#3498db', '#2980b9', '#1abc9c'],
      category: 'environmental'
    },
    {
      icon: 'earth',
      title: 'Waste Reduced',
      value: `${userStats.wasteReduced} kg`,
      subtitle: 'Landfill Diverted',
      description: 'Total waste diverted from landfills through your recycling actions',
      anim: new Animated.Value(0),
      delay: 700,
      color: ['#9b59b6', '#8e44ad', '#663399'],
      category: 'impact'
    },
    {
      icon: 'trophy',
      title: 'Total Points',
      value: userStats.points.toString(),
      subtitle: 'Achievement Score',
      description: 'Your cumulative recycling achievement points',
      anim: new Animated.Value(0),
      delay: 800,
      color: ['#e74c3c', '#c0392b', '#a93226'],
      category: 'achievement'
    }
  ], [userStats]); // Dependency on userStats ensures recalculation when userPoints changes

  // Enhanced particle system
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 3 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
      direction: Math.random() * Math.PI * 2,
      anim: new Animated.Value(0),
      color: ['#4ecca3', '#667eea', '#f093fb', '#00C9FF', '#fee140'][Math.floor(Math.random() * 5)],
      type: ['circle', 'star', 'diamond'][Math.floor(Math.random() * 3)] as 'circle' | 'star' | 'diamond'
    }))
  );

  // Enhanced user authentication effect with points fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoadingUser(true);

      if (user) {
        try {
          // Try to get display name from auth first
          if (user.displayName) {
            setUserName(user.displayName);
          } else {
            // Fallback to Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserName(userData.name || 'User');
            } else {
              setUserName('User');
            }
          }

          // Fetch user points
          const points = await fetchUserPoints(user.uid);
          setUserPoints(points);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('User');
          setUserPoints(0);
        }
      } else {
        setUserName('');
        setUserPoints(0);
      }

      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to refresh user points (can be called when returning from other screens)
  const refreshUserPoints = useCallback(async () => {
    if (user) {
      try {
        const points = await fetchUserPoints(user.uid);
        setUserPoints(points);
      } catch (error) {
        console.error('Error refreshing user points:', error);
      }
    }
  }, [user]);

  // Refresh points when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserPoints();
    }, [refreshUserPoints])
  );

  // Enhanced animation functions
  const startFloatingAnimation = useCallback(() => {
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
        }),
      ])
    ).start();
  }, [floatAnim]);

  const startPulsingAnimation = useCallback(() => {
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
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const startWaveAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  const startShimmerAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const startGlowAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const startParticleAnimations = useCallback(() => {
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        particle.anim.setValue(0);
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 4000 + Math.random() * 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setTimeout(animateParticle, Math.random() * 2000);
        });
      };

      setTimeout(animateParticle, index * 200);
    });
  }, [particles]);

  const animateStatCards = useCallback(() => {
    statCards.forEach((card, index) => {
      setTimeout(() => {
        Animated.spring(card.anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, card.delay);
    });
  }, [statCards]);

  const animateStatistics = useCallback(() => {
    setTimeout(() => {
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, [statsAnim]);

  // Enhanced focus effect with better performance
  useFocusEffect(
    useCallback(() => {
      if (!isReady) {
        // Initial setup animations
        const setupAnimations = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(buttonTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]);

        setupAnimations.start(() => {
          setIsReady(true);

          // Start continuous animations
          startFloatingAnimation();
          startPulsingAnimation();
          startWaveAnimation();
          startShimmerAnimation();
          startGlowAnimation();
          startParticleAnimations();

          // Start timed animations
          animateStatCards();
          animateStatistics();
        });

        // Start leaf rotation immediately
        Animated.loop(
          Animated.timing(leafRotate, {
            toValue: 1,
            duration: 20000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      }

      return () => {
        // Cleanup animations on unfocus
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        buttonTranslateY.stopAnimation();
        leafRotate.stopAnimation();
        floatAnim.stopAnimation();
        pulseAnim.stopAnimation();
        waveAnim.stopAnimation();
        shimmerAnim.stopAnimation();
        glowAnim.stopAnimation();
        statsAnim.stopAnimation();

        particles.forEach(particle => particle.anim.stopAnimation());
        statCards.forEach(card => card.anim.stopAnimation());
      };
    }, [])
  );

  // Re-animate stat cards when userPoints changes
  useEffect(() => {
    if (isReady) {
      animateStatCards();
    }
  }, [userPoints, isReady, animateStatCards]);

  // Animated value for header background opacity
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Enhanced scroll handlers
  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => setIsScrolling(false), 100);
  }, []);

  // Enhanced interaction handlers
  const handleStatPress = useCallback((stat: StatCard) => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
    Alert.alert(
      stat.title,
      stat.description,
      [{ text: 'Got it!', style: 'default' }]
    );
  }, []);

  // Back button handler
  const handleBackPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
    router.push('/account');
  }, [router]);

  // Enhanced computed values for animations
  const leafRotation = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width * 2],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  if (!isReady) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0f0f23" : "#ffffff"}
          translucent={false}
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isDark && styles.containerDark
    ]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0f0f23" : "#ffffff"}
        translucent={false}
      />

      {/* Top Bar with Back Button on Left, Welcome in Center, Theme Toggle and Hamburger on Right */}
      <Animated.View
        style={[
          styles.topBar,
          {
            backgroundColor: headerBackgroundOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: isDark ? ['rgba(15, 15, 35, 0)', 'rgba(15, 15, 35, 0.9)'] : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)'],
            }),
            shadowColor: isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
            shadowOpacity: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }),
            shadowRadius: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }),
            elevation: headerBackgroundOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
          }
        ]}
      >
        {/* Back Button on Left */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={isDark ? '#ffffff' : '#2c3e50'}
            />
          </TouchableOpacity>
        </View>

        {/* Welcome Text in Center */}
        <View style={styles.centerSection}>
          <WelcomeSection
            userName={userName}
            isLoadingUser={isLoadingUser}
            isDark={isDark}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </View>

        {/* Right Section with Theme Toggle and Hamburger */}
        <View style={styles.rightSection}>
          {/* Theme Toggle Button to the left of hamburger */}
          <TouchableOpacity
            style={[
              styles.themeToggleButtonRight,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={24}
              color={isDark ? '#ffd700' : '#2c3e50'}
            />
          </TouchableOpacity>

          {/* Hamburger Menu */}
          <HamburgerMenu isDark={isDark} router={router} />
        </View>
      </Animated.View>

      {/* Enhanced animated background with glassmorphism */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Enhanced gradient overlay with more stops */}
        <LinearGradient
          colors={isDark
            ? ['#0f0f23', '#1a1a2e', '#16213e', '#0f3460', '#1a1a2e', '#0f0f23']
            : ['#ffffff', '#f8fafc', '#e6f7ff', '#f0f8f5', '#fafafa', '#ffffff']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Enhanced animated wave backgrounds with glassmorphism */}
        <Animated.View
          style={[
            styles.waveBackground,
            {
              transform: [{ translateX: waveTranslateX }],
              opacity: isDark ? 0.06 : 0.08
            }
          ]}
        />

        <Animated.View
          style={[
            styles.waveBackground2,
            {
              transform: [{ translateX: waveTranslateX.interpolate({
                inputRange: [0, width * 0.6],
                outputRange: [width * 0.3, -width * 0.3]
              }) }],
              opacity: isDark ? 0.05 : 0.07
            }
          ]}
        />

        {/* Enhanced animated leaf background */}
        <Animated.Image
          source={require('@/assets/images/faint-leaf.png')}
          style={[
            styles.backgroundLeaf,
            {
              opacity: isDark ? 0.08 : 0.1,
              transform: [
                { rotate: leafRotation },
                { scale: isMobile ? 1.2 : 1.6 }
              ],
              tintColor: isDark ? '#4ecca3' : '#2ecc71'
            }
          ]}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Enhanced secondary decorative leaf */}
        <Animated.Image
          source={require('@/assets/images/faint-leaf.png')}
          style={[
            styles.secondaryLeaf,
            {
              opacity: isDark ? 0.06 : 0.08,
              transform: [
                { rotate: '-60deg' },
                { scale: isMobile ? 1 : 1.3 }
              ],
              tintColor: isDark ? '#667eea' : '#3498db'
            }
          ]}
          resizeMode="contain"
          fadeDuration={0}
        />

        {/* Enhanced particle system with different shapes */}
        {particles.map((particle, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: particle.anim.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0, particle.opacity * 0.8, particle.opacity]
                }),
                transform: [
                  {
                    translateY: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50 * particle.speed]
                    })
                  },
                  {
                    translateX: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 25 * Math.sin(particle.direction)]
                    })
                  },
                  {
                    scale: particle.anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.2, 1.6, 1]
                    })
                  },
                  {
                    rotate: particle.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', particle.type === 'star' ? '720deg' : '360deg']
                    })
                  }
                ],
                backgroundColor: particle.color,
                borderRadius: particle.type === 'circle' ? particle.size / 2 :
                              particle.type === 'star' ? 0 : particle.size / 4
              }
            ]}
          />
        ))}

        {/* Enhanced shimmer effect */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerTranslateX }],
              opacity: isDark ? 0.12 : 0.18
            }
          ]}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? 120 : 100 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Enhanced header section with better responsive design */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              paddingTop: Platform.OS === 'ios'
                ? (isMobile ? 40 : 60)
                : (isMobile ? 20 : 40)
            }
          ]}
        >
          {/* Enhanced logo container with glassmorphism */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateY: logoTranslateY }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={isMobile ? 80 : isTablet ? 100 : 120}
              color={isDark ? '#4ecca3' : '#667eea'}
              style={styles.logoIcon}
            />
          </Animated.View>

          {/* Enhanced subtitle with better typography */}
          <Animated.Text
            style={[
              styles.subtitle,
              isDark && styles.subtitleDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 18 : isTablet ? 22 : 26,
                lineHeight: isMobile ? 26 : isTablet ? 30 : 36
              }
            ]}
          >
            Your Environmental Impact Dashboard
          </Animated.Text>

          {/* Enhanced description with better readability */}
          <Animated.Text
            style={[
              styles.description,
              isDark && styles.descriptionDark,
              {
                opacity: fadeAnim,
                fontSize: isMobile ? 14 : isTablet ? 15 : 17,
                lineHeight: isMobile ? 22 : isTablet ? 24 : 28
              }
            ]}
          >
            Track your recycling achievements and environmental contributions.\n
            Every action you take makes a difference for our planet.
          </Animated.Text>
        </Animated.View>

        {/* Enhanced statistics section with better grid layout */}
        <Animated.View
          style={[
            styles.statisticsSection,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={[
            styles.sectionTitle,
            isDark && styles.sectionTitleDark,
            { fontSize: isMobile ? 24 : isTablet ? 30 : 36 }
          ]}>
            Your Recycling Statistics
          </Text>
          <Text style={[
            styles.sectionSubtitle,
            isDark && styles.sectionSubtitleDark,
            { fontSize: isMobile ? 15 : isTablet ? 16 : 18 }
          ]}>
            See the positive impact you're making on the environment
          </Text>

          <View style={[
            styles.statisticsGrid,
            {
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }
          ]}>
            {statCards.map((stat, index) => (
              <Animated.View
                key={`stat-${index}`}
                style={[
                  styles.statCard,
                  isDark && styles.statCardDark,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '48%',
                    marginBottom: isMobile ? 20 : 24,
                    opacity: stat.anim,
                    transform: [
                      {
                        scale: stat.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1]
                        })
                      },
                      {
                        translateY: stat.anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [40, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleStatPress(stat)}
                  activeOpacity={0.8}
                  style={[
                    styles.statCardContent,
                    { padding: isMobile ? 20 : isTablet ? 24 : 28 }
                  ]}
                >
                  <LinearGradient
                    colors={stat.color}
                    style={[
                      styles.statIconContainer,
                      {
                        width: isMobile ? 56 : isTablet ? 64 : 70,
                        height: isMobile ? 56 : isTablet ? 64 : 70,
                        borderRadius: isMobile ? 18 : isTablet ? 20 : 24
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={stat.icon as any}
                      size={isMobile ? 24 : isTablet ? 28 : 32}
                      color="#ffffff"
                    />
                  </LinearGradient>

                  <Text style={[
                    styles.statValue,
                    isDark && styles.statValueDark,
                    { fontSize: isMobile ? 24 : isTablet ? 28 : 32 }
                  ]}>
                    {stat.value}
                  </Text>

                  <Text style={[
                    styles.statTitle,
                    isDark && styles.statTitleDark,
                    { fontSize: isMobile ? 16 : isTablet ? 18 : 20 }
                  ]}>
                    {stat.title}
                  </Text>

                  <Text style={[
                    styles.statSubtitle,
                    isDark && styles.statSubtitleDark,
                    { fontSize: isMobile ? 12 : isTablet ? 13 : 14 }
                  ]}>
                    {stat.subtitle}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Main styles (keeping existing styles and adding new ones for stats layout)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    zIndex: 1000,
  },
  leftSection: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeSectionContainer: {
    alignItems: 'center',
  },
  welcomeTextLeft: {
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  themeToggleButtonRight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuFooterText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveBackground: {
    position: 'absolute',
    top: height * 0.1,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.3,
    backgroundColor: '#4ecca3',
    borderRadius: width,
  },
  waveBackground2: {
    position: 'absolute',
    top: height * 0.6,
    right: -width * 0.5,
    width: width * 1.8,
    height: height * 0.25,
    backgroundColor: '#667eea',
    borderRadius: width,
  },
  backgroundLeaf: {
    position: 'absolute',
    top: height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
  },
  secondaryLeaf: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width * 0.3,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isMobile ? 40 : 60,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 40 : 60,
  },
  logoContainer: {
    marginBottom: isMobile ? 24 : 32,
    alignItems: 'center',
  },
  logoIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  subtitle: {
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 16 : 20,
    letterSpacing: 0.5,
},
  subtitleDark: {
    color: '#ffffff',
  },
  description: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: isMobile ? 32 : 40,
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  descriptionDark: {
    color: '#bdc3c7',
  },
  statisticsSection: {
    paddingHorizontal: isMobile ? 20 : isTablet ? 40 : 60,
    marginBottom: isMobile ? 50 : 70,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 12 : 16,
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontWeight: '400',
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: isMobile ? 32 : 40,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  sectionSubtitleDark: {
    color: '#bdc3c7',
  },
  statisticsGrid: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? 20 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
  },
  statCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(78, 204, 163, 0.2)',
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isMobile ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  statValue: {
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 8 : 12,
    letterSpacing: 0.5,
  },
  statValueDark: {
    color: '#ffffff',
  },
  statTitle: {
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: isMobile ? 6 : 8,
    letterSpacing: 0.3,
  },
  statTitleDark: {
    color: '#ffffff',
  },
  statSubtitle: {
    fontWeight: '400',
    color: '#667eea',
    textAlign: 'center',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  statSubtitleDark: {
    color: '#4ecca3',
  },
});
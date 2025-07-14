import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useColorScheme as _useColorScheme,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';

// Firebase imports for user authentication and points
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Enhanced type definitions for games
interface GameItem {
  id: string;
  name: string;
  icon: string;
  category: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'electronic';
  color: [string, string];
  sorted: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  icon: string;
}

interface MiniGame {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: [string, string];
  anim: Animated.Value;
  scaleAnim: Animated.Value;
  pulseAnim: Animated.Value;
  delay: number;
}

interface GameStats {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
}

interface RecyclingBin {
  category: 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'electronic';
  name: string;
  icon: string;
  color: [string, string];
  isSelected: boolean;
}

// Enhanced responsive system with better calculations
const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isPhone = width < 768;

// Comprehensive breakpoint system optimized for phones
const breakpoints = {
  xs: 0,
  sm: 380,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
};

const getDeviceType = () => {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'xl';
  if (width < breakpoints.xxl) return 'xxl';
  return 'xxl';
};

const deviceType = getDeviceType();

// Enhanced responsive dimensions with phone-first approach
const getResponsiveDimensions = () => {
  const baseSpacing = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28
  }[deviceType];

  const baseFontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 18,
    xxl: 20
  }[deviceType];

  return {
    // Layout dimensions - phone optimized
    containerPadding: baseSpacing,
    cardPadding: baseSpacing + 2,
    sectionSpacing: baseSpacing * 1.5,
    
    // Typography scale - phone optimized
    titleSize: isPhone ? baseFontSize + 8 : baseFontSize + 16,
    subtitleSize: baseFontSize + 2,
    bodySize: baseFontSize,
    captionSize: baseFontSize - 2,
    
    // Component sizes - smaller for phones
    iconSize: isPhone ? baseSpacing + 8 : baseSpacing + 16,
    buttonHeight: isPhone ? baseSpacing * 2.5 : baseSpacing * 3,
    smallButtonSize: isPhone ? 32 : 40,
    gameCardSize: isPhone ? 120 : 150,
    
    // Grid calculations - phone optimized
    gameCardWidth: (() => {
      if (deviceType === 'xs' || deviceType === 'sm') return width - (baseSpacing * 2);
      if (deviceType === 'md') return (width - (baseSpacing * 3)) / 2;
      return (width - (baseSpacing * 4)) / 2;
    })(),
    
    // Animation values
    animationDuration: deviceType === 'xs' ? 500 : 600,
    staggerDelay: deviceType === 'xs' ? 40 : 80,
  };
};

// Custom hook for enhanced color scheme management
const useColorScheme = () => {
  const colorScheme = _useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  return { theme, toggleTheme };
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

// Advanced animation system with sophisticated effects
const useAnimations = () => {
  const dimensions = getResponsiveDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Advanced parallax effects with multiple layers
  const backgroundTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -200],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: 'clamp'
  });

  // Advanced floating animations with multiple patterns
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const floatingAnim4 = useRef(new Animated.Value(0)).current;
  
  // Shimmer effect animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Multiple sophisticated floating patterns
    const floating1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const floating2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const floating3 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim3, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim3, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const floating4 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim4, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim4, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer effect
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    floating1.start();
    floating2.start();
    floating3.start();
    floating4.start();
    shimmer.start();

    return () => {
      floating1.stop();
      floating2.stop();
      floating3.stop();
      floating4.stop();
      shimmer.stop();
    };
  }, [floatingAnim1, floatingAnim2, floatingAnim3, floatingAnim4, shimmerAnim]);

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: dimensions.animationDuration + 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: dimensions.animationDuration + 100,
        delay: 200,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: dimensions.animationDuration + 100,
        delay: 400,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, buttonScaleAnim, dimensions.animationDuration]);

  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    headerTranslateY.setValue(-50);
    contentTranslateY.setValue(30);
    buttonScaleAnim.setValue(0.9);
    scrollY.setValue(0);
  }, [fadeAnim, scaleAnim, headerTranslateY, contentTranslateY, buttonScaleAnim, scrollY]);

  return {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    floatingAnim4,
    shimmerAnim,
    startAnimations,
    resetAnimations
  };
};

export default function GameScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    streak: 0
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // User state for points management
  const [user, setUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Points confirmation modal state
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  // Sorting game state
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [sortingItems, setSortingItems] = useState<GameItem[]>([]);
  const [sortingBins, setSortingBins] = useState<RecyclingBin[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [sortingGameComplete, setSortingGameComplete] = useState(false);
  
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === 'dark';
  const dimensions = getResponsiveDimensions();
  
  const {
    fadeAnim,
    scaleAnim,
    headerTranslateY,
    contentTranslateY,
    buttonScaleAnim,
    scrollY,
    backgroundTranslateY,
    headerOpacity,
    headerScale,
    floatingAnim1,
    floatingAnim2,
    floatingAnim3,
    floatingAnim4,
    shimmerAnim,
    startAnimations,
    resetAnimations
  } = useAnimations();

  // Game data
  const recyclingItemsData = useMemo<Omit<GameItem, 'sorted'>[]>(() => [
    { id: '1', name: 'Plastic Bottle', icon: 'bottle-soda', category: 'plastic', color: ['#00C9FF', '#92FE9D'] },
    { id: '2', name: 'Newspaper', icon: 'newspaper', category: 'paper', color: ['#667eea', '#764ba2'] },
    { id: '3', name: 'Glass Jar', icon: 'glass-mug', category: 'glass', color: ['#f093fb', '#f5576c'] },
    { id: '4', name: 'Aluminum Can', icon: 'can', category: 'metal', color: ['#4facfe', '#00f2fe'] },
    { id: '5', name: 'Apple Core', icon: 'apple', category: 'organic', color: ['#43e97b', '#38f9d7'] },
    { id: '6', name: 'Old Phone', icon: 'cellphone', category: 'electronic', color: ['#fa709a', '#fee140'] },
    { id: '7', name: 'Cardboard Box', icon: 'package-variant', category: 'paper', color: ['#667eea', '#764ba2'] },
    { id: '8', name: 'Wine Bottle', icon: 'bottle-wine', category: 'glass', color: ['#f093fb', '#f5576c'] }
  ], []);

  const quizQuestions = useMemo<QuizQuestion[]>(() => [
    {
      id: '1',
      question: 'Which bin should plastic bottles go into?',
      options: ['General Waste', 'Recycling Bin', 'Organic Waste', 'Hazardous Waste'],
      correctAnswer: 1,
      explanation: 'Plastic bottles are recyclable and should go into the recycling bin to be processed into new products.',
      icon: 'bottle-soda'
    },
    {
      id: '2',
      question: 'What percentage of plastic waste is actually recycled globally?',
      options: ['50%', '25%', '9%', '75%'],
      correctAnswer: 2,
      explanation: 'Only about 9% of plastic waste is recycled globally, highlighting the importance of reducing plastic use.',
      icon: 'recycle'
    },
    {
      id: '3',
      question: 'How long does it take for a plastic bottle to decompose?',
      options: ['1 year', '10 years', '100 years', '450 years'],
      correctAnswer: 3,
      explanation: 'Plastic bottles can take up to 450 years to decompose, making recycling crucial for environmental protection.',
      icon: 'clock-outline'
    },
    {
      id: '4',
      question: 'Which material can be recycled indefinitely without losing quality?',
      options: ['Plastic', 'Paper', 'Glass', 'Cardboard'],
      correctAnswer: 2,
      explanation: 'Glass can be recycled indefinitely without losing quality, making it one of the most sustainable materials.',
      icon: 'glass-mug'
    },
    {
      id: '5',
      question: 'What should you do before recycling containers?',
      options: ['Break them', 'Clean them', 'Paint them', 'Nothing'],
      correctAnswer: 1,
      explanation: 'Containers should be cleaned before recycling to prevent contamination and ensure proper processing.',
      icon: 'water'
    }
  ], []);

  const miniGames = useMemo<MiniGame[]>(() => [
    {
      id: 'sorting',
      title: 'Recycling Sorter',
      description: 'Sort items into the correct recycling bins',
      icon: 'sort-variant',
      color: ['#667eea', '#764ba2'],
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 200
    },
    {
      id: 'quiz',
      title: 'Eco Quiz Challenge',
      description: 'Test your recycling knowledge',
      icon: 'help-circle',
      color: ['#00C9FF', '#92FE9D'],
      anim: new Animated.Value(0),
      scaleAnim: new Animated.Value(1),
      pulseAnim: new Animated.Value(0),
      delay: 300
    }
  ], []);

  const recyclingBinsData = useMemo<Omit<RecyclingBin, 'isSelected'>[]>(() => [
    { category: 'plastic', name: 'Plastic', icon: 'bottle-soda', color: ['#00C9FF', '#92FE9D'] },
    { category: 'paper', name: 'Paper', icon: 'newspaper', color: ['#667eea', '#764ba2'] },
    { category: 'glass', name: 'Glass', icon: 'glass-mug', color: ['#f093fb', '#f5576c'] },
    { category: 'metal', name: 'Metal', icon: 'can', color: ['#4facfe', '#00f2fe'] },
    { category: 'organic', name: 'Organic', icon: 'apple', color: ['#43e97b', '#38f9d7'] },
    { category: 'electronic', name: 'Electronic', icon: 'cellphone', color: ['#fa709a', '#fee140'] }
  ], []);

  // Enhanced user authentication effect with points fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoadingUser(true);

      if (user) {
        try {
          // Fetch user points
          const points = await fetchUserPoints(user.uid);
          setUserPoints(points);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserPoints(0);
        }
      } else {
        setUserPoints(0);
      }

      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to refresh user points
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

  // Initialize sorting game
  const initializeSortingGame = useCallback(() => {
    const shuffledItems = [...recyclingItemsData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map(item => ({ ...item, sorted: false }));
    
    const bins = recyclingBinsData.map(bin => ({ ...bin, isSelected: false }));
    
    setSortingItems(shuffledItems);
    setSortingBins(bins);
    setCurrentItemIndex(0);
    setSortingGameComplete(false);
    setSelectedItem(null);
    setSelectedBin(null);
    setGameStats({
      score: 0,
      correctAnswers: 0,
      totalQuestions: shuffledItems.length,
      streak: 0
    });
  }, [recyclingItemsData, recyclingBinsData]);

  // Enhanced web optimizations
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.getElementsByTagName('head')[0].appendChild(meta);

      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = isDark ? '#0f0f23' : '#ffffff';
      document.getElementsByTagName('head')[0].appendChild(themeColorMeta);

      document.documentElement.style.scrollBehavior = 'smooth';
      document.documentElement.style.overscrollBehavior = 'none';

      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(fontLink);

      document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      document.body.style.fontOpticalSizing = 'auto';
      document.body.style.fontFeatureSettings = '"cv02", "cv03", "cv04", "cv11"';
      document.body.style.textRendering = 'optimizeLegibility';
     
      if (width < breakpoints.md) {
        document.addEventListener('touchstart', () => {}, { passive: true });
      }

      return () => {
        try {
          document.getElementsByTagName('head')[0].removeChild(meta);
          document.getElementsByTagName('head')[0].removeChild(themeColorMeta);
          document.head.removeChild(fontLink);
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    }
  }, [isDark, width]);

  // Advanced focus effect with sophisticated animations
  useFocusEffect(
    useCallback(() => {
      resetAnimations();
      
      // Reset all animations
      miniGames.forEach(game => {
        game.anim.setValue(0);
        game.scaleAnim.setValue(1);
        game.pulseAnim.setValue(0);
      });

      const timeout = setTimeout(() => {
        setIsReady(true);
        startAnimations();

        // Advanced staggered animations for games
        miniGames.forEach((game) => {
          Animated.parallel([
            Animated.timing(game.anim, {
              toValue: 1,
              duration: dimensions.animationDuration,
              delay: game.delay,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            })
          ]).start();

          // Advanced pulse animation for games
          const pulseGame = () => {
            Animated.sequence([
              Animated.timing(game.scaleAnim, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(game.scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              })
            ]).start(() => {
              setTimeout(pulseGame, 3000 + Math.random() * 2000);
            });
          };

          // Pulse glow effect
          const pulseGlow = () => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(game.pulseAnim, {
                  toValue: 1,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(game.pulseAnim, {
                  toValue: 0,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                })
              ])
            ).start();
          };

          setTimeout(pulseGame, game.delay + 1000);
          setTimeout(pulseGlow, game.delay + 1500);
        });

      }, 100);

      return () => {
        clearTimeout(timeout);
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
        headerTranslateY.stopAnimation();
        contentTranslateY.stopAnimation();
        buttonScaleAnim.stopAnimation();
        miniGames.forEach(game => {
          game.anim.stopAnimation();
          game.scaleAnim.stopAnimation();
          game.pulseAnim.stopAnimation();
        });
      };
    }, [miniGames, resetAnimations, startAnimations, dimensions])
  );

  // Game handlers with points deduction
  const handleGamePress = useCallback((gameId: string) => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    
    // Start the game directly without points check
    setCurrentGame(gameId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (gameId === 'sorting') {
      initializeSortingGame();
    } else if (gameId === 'quiz') {
      setGameStats({
        score: 0,
        correctAnswers: 0,
        totalQuestions: quizQuestions.length,
        streak: 0
      });
    }
    
    // Close modal if it was open (though it won't be triggered now)
    setShowPointsModal(false);
    setSelectedGameId(null);
  }, [initializeSortingGame, quizQuestions.length]);

  const handleConfirmPlayGame = useCallback(async () => {
    // This function is no longer needed as games are free to play
    // It's kept for structural integrity but its logic is bypassed.
    if (!user || !selectedGameId) return;
    
    // Start the game directly
    setCurrentGame(selectedGameId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (selectedGameId === 'sorting') {
      initializeSortingGame();
    } else if (selectedGameId === 'quiz') {
      setGameStats({
        score: 0,
        correctAnswers: 0,
        totalQuestions: quizQuestions.length,
        streak: 0
      });
    }
    
    // Close modal
    setShowPointsModal(false);
    setSelectedGameId(null);
  }, [user, selectedGameId, initializeSortingGame, quizQuestions.length]);

  const handleCancelPlayGame = useCallback(() => {
    setShowPointsModal(false);
    setSelectedGameId(null);
  }, []);

  const handleQuizAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setGameStats(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 100 : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0
    }));
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(isCorrect ? 60 : [100, 50, 100]);
    }
  }, [selectedAnswer, currentQuestionIndex, quizQuestions]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setCurrentGame(null);
    }
  }, [currentQuestionIndex, quizQuestions.length]);

  // Sorting game handlers
  const handleBinSelect = useCallback((binCategory: string) => {
    if (sortingGameComplete || currentItemIndex >= sortingItems.length) return;
    
    const currentItem = sortingItems[currentItemIndex];
    const isCorrect = currentItem.category === binCategory;
    
    // Update game stats
    setGameStats(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 20 : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0
    }));
    
    // Mark item as sorted
    setSortingItems(prev => prev.map((item, index) => 
      index === currentItemIndex ? { ...item, sorted: true } : item
    ));
    
    // Visual feedback
    setSelectedBin(binCategory);
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(isCorrect ? 60 : [100, 50, 100]);
    }
    
    // Move to next item after delay
    setTimeout(() => {
      if (currentItemIndex < sortingItems.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
        setSelectedBin(null);
      } else {
        setSortingGameComplete(true);
        setSelectedBin(null);
      }
    }, 1000);
  }, [currentItemIndex, sortingItems, sortingGameComplete]);

  const handleRestartSorting = useCallback(() => {
    initializeSortingGame();
  }, [initializeSortingGame]);

  const handleGoBack = useCallback(() => {
    if (currentGame) {
      setCurrentGame(null);
      return;
    }
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(60);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: -50,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.push('/account');
    });
  }, [currentGame, fadeAnim, headerTranslateY, router]);

  // Points confirmation modal component (now unused for game start, but kept for reference)
  const renderPointsModal = () => (
    <Modal
      visible={showPointsModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancelPlayGame}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isDark && styles.modalContainerDark
        ]}>
          <View style={[
            styles.modalContent,
            { padding: dimensions.cardPadding * 1.5 }
          ]}>
            <MaterialCommunityIcons
              name="star"
              size={dimensions.iconSize + 16}
              color={isDark ? '#4ecca3' : '#667eea'}
              style={{ marginBottom: dimensions.containerPadding }}
            />
            
            <Text style={[
              styles.modalTitle,
              isDark && styles.modalTitleDark,
              { 
                fontSize: dimensions.titleSize,
                marginBottom: dimensions.containerPadding
              }
            ]}>
              Play Game
            </Text>
            
            <Text style={[
              styles.modalText,
              isDark && styles.modalTextDark,
              { 
                fontSize: dimensions.bodySize,
                lineHeight: dimensions.bodySize * 1.4,
                marginBottom: dimensions.containerPadding * 1.5
              }
            ]}>
              This game is now free to play!
            </Text>
            
            <View style={[
              styles.modalButtons,
              { gap: dimensions.containerPadding }
            ]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonCancel,
                  isDark && styles.modalButtonCancelDark,
                  {
                    height: dimensions.buttonHeight,
                    borderRadius: dimensions.buttonHeight / 2,
                    flex: 1
                  }
                ]}
                onPress={handleCancelPlayGame}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modalButtonText,
                  styles.modalButtonTextCancel,
                  isDark && styles.modalButtonTextCancelDark,
                  { fontSize: dimensions.bodySize }
                ]}>
                  Close
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    height: dimensions.buttonHeight,
                    borderRadius: dimensions.buttonHeight / 2,
                    flex: 1
                  }
                ]}
                onPress={handleConfirmPlayGame}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#4ecca3', '#44a08d'] : ['#667eea', '#764ba2']}
                  style={[
                    styles.modalButtonGradient,
                    {
                      height: dimensions.buttonHeight,
                      borderRadius: dimensions.buttonHeight / 2
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.modalButtonText,
                    { fontSize: dimensions.bodySize }
                  ]}>
                    Play Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Enhanced component renderers
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerSection,
        {
          marginBottom: dimensions.sectionSpacing,
          opacity: headerOpacity,
          transform: [
            { translateY: headerTranslateY },
            { scale: headerScale }
          ]
        }
      ]}
    >
      <Animated.View style={{
        transform: [{
          translateY: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }]
      }}>
        <Text style={[
          styles.pageTitle,
          isDark && styles.pageTitleDark,
          { 
            fontSize: dimensions.titleSize + (isPhone ? 4 : 8),
            marginBottom: dimensions.containerPadding
          }
        ]}>
          {currentGame ? (currentGame === 'quiz' ? 'Eco Quiz Challenge' : 'Recycling Sorter') : 'Recycling Games'}
        </Text>
      </Animated.View>
      
      {!currentGame && (
        <>
          <Text style={[
            styles.pageSubtitle,
            isDark && styles.pageSubtitleDark,
            { 
              fontSize: dimensions.subtitleSize,
              paddingHorizontal: dimensions.containerPadding,
              lineHeight: dimensions.subtitleSize * 1.5,
              marginBottom: dimensions.containerPadding
            }
          ]}>
            Learn about recycling through fun, interactive games that test your knowledge and sorting skills.
          </Text>
          
          {/* Display current points */}
          <View style={[
            styles.pointsDisplay,
            isDark && styles.pointsDisplayDark,
            {
              paddingHorizontal: dimensions.cardPadding,
              paddingVertical: dimensions.containerPadding / 2,
              borderRadius: dimensions.containerPadding * 2
            }
          ]}>
            <MaterialCommunityIcons
              name="star"
              size={dimensions.bodySize + 4}
              color={isDark ? '#4ecca3' : '#667eea'}
              style={{ marginRight: dimensions.containerPadding / 2 }}
            />
            <Text style={[
              styles.pointsText,
              isDark && styles.pointsTextDark,
              { fontSize: dimensions.bodySize }
            ]}>
              {userPoints} Points
            </Text>
          </View>
        </>
      )}
    </Animated.View>
  );

  const renderGameStats = () => (
    <View style={[styles.statsContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <View style={[
        styles.statsGrid,
        { gap: dimensions.containerPadding / 2 }
      ]}>
        <View style={[
          styles.statCard,
          isDark && styles.statCardDark,
          {
            padding: dimensions.cardPadding - (isPhone ? 4 : 8),
          }
        ]}>
          <Text style={[
            styles.statValue,
            isDark && styles.statValueDark,
            { fontSize: isPhone ? dimensions.subtitleSize : dimensions.titleSize - 4 }
          ]}>
            {gameStats.score}
          </Text>
          <Text style={[
            styles.statLabel,
            isDark && styles.statLabelDark,
            { fontSize: isPhone ? dimensions.captionSize : dimensions.bodySize }
          ]}>
            Score
          </Text>
        </View>
        
        <View style={[
          styles.statCard,
          isDark && styles.statCardDark,
          {
            padding: dimensions.cardPadding - (isPhone ? 4 : 8),
          }
        ]}>
          <Text style={[
            styles.statValue,
            isDark && styles.statValueDark,
            { fontSize: isPhone ? dimensions.subtitleSize : dimensions.titleSize - 4 }
          ]}>
            {gameStats.correctAnswers}/{gameStats.totalQuestions}
          </Text>
          <Text style={[
            styles.statLabel,
            isDark && styles.statLabelDark,
            { fontSize: isPhone ? dimensions.captionSize : dimensions.bodySize }
          ]}>
            Correct
          </Text>
        </View>
        
        <View style={[
          styles.statCard,
          isDark && styles.statCardDark,
          {
            padding: dimensions.cardPadding - (isPhone ? 4 : 8),
          }
        ]}>
          <Text style={[
            styles.statValue,
            isDark && styles.statValueDark,
            { fontSize: isPhone ? dimensions.subtitleSize : dimensions.titleSize - 4 }
          ]}>
            {gameStats.streak}
          </Text>
          <Text style={[
            styles.statLabel,
            isDark && styles.statLabelDark,
            { fontSize: isPhone ? dimensions.captionSize : dimensions.bodySize }
          ]}>
            Streak
          </Text>
        </View>
      </View>
    </View>
  );

  const renderGameSelection = () => (
    <View style={[styles.gamesContainer, { marginBottom: dimensions.sectionSpacing }]}>
      <Text style={[
        styles.sectionTitle,
        isDark && styles.sectionTitleDark,
        { 
          fontSize: dimensions.titleSize,
          marginBottom: dimensions.sectionSpacing / 2,
          paddingHorizontal: dimensions.containerPadding
        }
      ]}>
        Choose Your Game
      </Text>
      
      <View style={[
        styles.gamesGrid,
        { gap: dimensions.containerPadding }
      ]}>
        {miniGames.map((game, index) => (
          <TouchableOpacity
            key={`game-${index}`}
            onPress={() => handleGamePress(game.id)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.gameCard,
                isDark && styles.gameCardDark,
                {
                  width: dimensions.gameCardWidth,
                  padding: dimensions.cardPadding,
                  opacity: game.anim,
                  transform: [
                    { 
                      translateY: game.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      }) 
                    },
                    { 
                      scale: game.scaleAnim
                    }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={game.color}
                style={[
                  styles.gameIconContainer,
                  {
                    width: dimensions.gameCardSize,
                    height: dimensions.gameCardSize,
                    borderRadius: dimensions.gameCardSize / 2,
                    marginBottom: dimensions.containerPadding
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={game.icon}
                  size={dimensions.gameCardSize / 2}
                  color="#fff"
                />
              </LinearGradient>
              
              <Text style={[
                styles.gameTitle,
                isDark && styles.gameTitleDark,
                { 
                  fontSize: dimensions.subtitleSize,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {game.title}
              </Text>
              
              <Text style={[
                styles.gameDescription,
                isDark && styles.gameDescriptionDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                {game.description}
              </Text>
              
              {/* Removed the 'Costs 5 points' text */}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuizGame = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    return (
      <View style={[styles.quizContainer, { marginBottom: dimensions.sectionSpacing }]}>
        {renderGameStats()}
        
        <View style={[
          styles.questionCard,
          isDark && styles.questionCardDark,
          {
            marginHorizontal: dimensions.containerPadding,
            padding: dimensions.cardPadding,
            marginBottom: dimensions.sectionSpacing
          }
        ]}>
          <View style={styles.questionHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={[
                styles.questionIconContainer,
                {
                  width: dimensions.iconSize,
                  height: dimensions.iconSize,
                  borderRadius: dimensions.iconSize / 2,
                  marginRight: dimensions.containerPadding
                }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={currentQuestion.icon}
                size={dimensions.iconSize - (isPhone ? 8 : 12)}
                color="#fff"
              />
            </LinearGradient>
            
            <View style={styles.questionInfo}>
              <Text style={[
                styles.questionNumber,
                isDark && styles.questionNumberDark,
                { fontSize: dimensions.captionSize }
              ]}>
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </Text>
              
              <Text style={[
                styles.questionText,
                isDark && styles.questionTextDark,
                { 
                  fontSize: dimensions.subtitleSize,
                  lineHeight: dimensions.subtitleSize * 1.4
                }
              ]}>
                {currentQuestion.question}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.optionsContainer, { gap: dimensions.containerPadding / 2 }]}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={`option-${index}`}
              onPress={() => handleQuizAnswer(index)}
              disabled={selectedAnswer !== null}
              activeOpacity={0.8}
            >
              <View style={[
                styles.optionCard,
                isDark && styles.optionCardDark,
                selectedAnswer === index && (
                  index === currentQuestion.correctAnswer 
                    ? styles.optionCorrect 
                    : styles.optionIncorrect
                ),
                selectedAnswer !== null && index === currentQuestion.correctAnswer && styles.optionCorrect,
                {
                  marginHorizontal: dimensions.containerPadding,
                  padding: dimensions.cardPadding
                }
              ]}>
                <Text style={[
                  styles.optionText,
                  isDark && styles.optionTextDark,
                  selectedAnswer === index && styles.optionTextSelected,
                  { fontSize: dimensions.bodySize }
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {showExplanation && (
          <View style={[
            styles.explanationCard,
            isDark && styles.explanationCardDark,
            {
              marginHorizontal: dimensions.containerPadding,
              padding: dimensions.cardPadding,
              marginTop: dimensions.sectionSpacing
            }
          ]}>
            <Text style={[
              styles.explanationTitle,
              isDark && styles.explanationTitleDark,
              { 
                fontSize: dimensions.subtitleSize,
                marginBottom: dimensions.containerPadding / 2
              }
            ]}>
              {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
            </Text>
            
            <Text style={[
              styles.explanationText,
              isDark && styles.explanationTextDark,
              { 
                fontSize: dimensions.bodySize,
                lineHeight: dimensions.bodySize * 1.4,
                marginBottom: dimensions.containerPadding
              }
            ]}>
              {currentQuestion.explanation}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  height: dimensions.buttonHeight,
                  borderRadius: dimensions.buttonHeight / 2
                }
              ]}
              onPress={handleNextQuestion}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[
                  styles.nextButtonGradient,
                  {
                    height: dimensions.buttonHeight,
                    borderRadius: dimensions.buttonHeight / 2
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[
                  styles.nextButtonText,
                  { fontSize: dimensions.bodySize }
                ]}>
                  {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSortingGame = () => {
    const currentItem = sortingItems[currentItemIndex];
    
    return (
      <View style={[styles.sortingContainer, { marginBottom: dimensions.sectionSpacing }]}>
        {renderGameStats()}
        
        {!sortingGameComplete && currentItem && (
          <>
            <Text style={[
              styles.sectionTitle,
              isDark && styles.sectionTitleDark,
              { 
                fontSize: dimensions.titleSize,
                marginBottom: dimensions.containerPadding,
                paddingHorizontal: dimensions.containerPadding
              }
            ]}>
              Sort this item:
            </Text>
            
            {/* Current Item to Sort */}
            <View style={[
              styles.currentItemContainer,
              {
                marginHorizontal: dimensions.containerPadding,
                marginBottom: dimensions.sectionSpacing
              }
            ]}>
              <View style={[
                styles.currentItemCard,
                isDark && styles.currentItemCardDark,
                {
                  padding: dimensions.cardPadding * 1.5
                }
              ]}>
                <LinearGradient
                  colors={currentItem.color}
                  style={[
                    styles.currentItemIcon,
                    {
                      width: dimensions.gameCardSize,
                      height: dimensions.gameCardSize,
                      borderRadius: dimensions.gameCardSize / 2,
                      marginBottom: dimensions.containerPadding
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name={currentItem.icon}
                    size={dimensions.gameCardSize / 2}
                    color="#fff"
                  />
                </LinearGradient>
                
                <Text style={[
                  styles.currentItemName,
                  isDark && styles.currentItemNameDark,
                  { 
                    fontSize: dimensions.titleSize,
                    marginBottom: dimensions.containerPadding / 2
                  }
                ]}>
                  {currentItem.name}
                </Text>
                
                <Text style={[
                  styles.currentItemProgress,
                  isDark && styles.currentItemProgressDark,
                  { fontSize: dimensions.bodySize }
                ]}>
                  Item {currentItemIndex + 1} of {sortingItems.length}
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.sectionTitle,
              isDark && styles.sectionTitleDark,
              { 
                fontSize: dimensions.subtitleSize,
                marginBottom: dimensions.containerPadding,
                paddingHorizontal: dimensions.containerPadding
              }
            ]}>
              Choose the correct bin:
            </Text>
          </>
        )}
        
        {/* Recycling Bins */}
        <View style={[styles.binsContainer, { marginBottom: dimensions.sectionSpacing }]}>
          <View style={[
            styles.binsGrid,
            { gap: dimensions.containerPadding / 2 }
          ]}>
            {sortingBins.map((bin, index) => (
              <TouchableOpacity
                key={`bin-${index}`}
                onPress={() => handleBinSelect(bin.category)}
                disabled={sortingGameComplete}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.binCard,
                  isDark && styles.binCardDark,
                  selectedBin === bin.category && styles.binCardSelected,
                  {
                    width: (width - (dimensions.containerPadding * 3)) / 2,
                    padding: dimensions.cardPadding,
                    marginBottom: dimensions.containerPadding / 2
                  }
                ]}>
                  <LinearGradient
                    colors={bin.color}
                    style={[
                      styles.binIconContainer,
                      {
                        width: dimensions.iconSize + 8,
                        height: dimensions.iconSize + 8,
                        borderRadius: (dimensions.iconSize + 8) / 2,
                        marginBottom: dimensions.containerPadding / 2
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={bin.icon}
                      size={dimensions.iconSize - 8}
                      color="#fff"
                    />
                  </LinearGradient>
                  
                  <Text style={[
                    styles.binLabel,
                    isDark && styles.binLabelDark,
                    { fontSize: dimensions.bodySize }
                  ]}>
                    {bin.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Game Complete */}
        {sortingGameComplete && (
          <View style={[
            styles.gameCompleteContainer,
            {
              marginHorizontal: dimensions.containerPadding,
              padding: dimensions.cardPadding
            }
          ]}>
            <View style={[
              styles.gameCompleteCard,
              isDark && styles.gameCompleteCardDark,
              {
                padding: dimensions.cardPadding * 1.5
              }
            ]}>
              <MaterialCommunityIcons
                name="trophy"
                size={dimensions.gameCardSize / 2}
                color="#43e97b"
                style={{ marginBottom: dimensions.containerPadding }}
              />
              
              <Text style={[
                styles.gameCompleteTitle,
                isDark && styles.gameCompleteTitleDark,
                { 
                  fontSize: dimensions.titleSize,
                  marginBottom: dimensions.containerPadding / 2
                }
              ]}>
                Game Complete!
              </Text>
              
              <Text style={[
                styles.gameCompleteText,
                isDark && styles.gameCompleteTextDark,
                { 
                  fontSize: dimensions.bodySize,
                  lineHeight: dimensions.bodySize * 1.4,
                  marginBottom: dimensions.containerPadding
                }
              ]}>
                You scored {gameStats.score} points and got {gameStats.correctAnswers} out of {gameStats.totalQuestions} items correct!
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.restartButton,
                  {
                    height: dimensions.buttonHeight,
                    borderRadius: dimensions.buttonHeight / 2
                  }
                ]}
                onPress={handleRestartSorting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#43e97b', '#38f9d7']}
                  style={[
                    styles.restartButtonGradient,
                    {
                      height: dimensions.buttonHeight,
                      borderRadius: dimensions.buttonHeight / 2
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.restartButtonText,
                    { fontSize: dimensions.bodySize }
                  ]}>
                    Play Again
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Enhanced background with floating elements
  const renderBackground = () => (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '10%',
            left: '5%',
            transform: [
              {
                translateY: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.floatingCircle, { 
            width: isPhone ? 60 : 80, 
            height: isPhone ? 60 : 80, 
            borderRadius: isPhone ? 30 : 40 
          }]}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '30%',
            right: '10%',
            transform: [
              {
                translateY: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#00C9FF', '#92FE9D']}
          style={[styles.floatingSquare, { 
            width: isPhone ? 45 : 60, 
            height: isPhone ? 45 : 60 
          }]}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            bottom: '20%',
            left: '15%',
            transform: [
              {
                translateY: floatingAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={[styles.floatingTriangle, { 
            width: isPhone ? 50 : 70, 
            height: isPhone ? 50 : 70, 
            borderRadius: isPhone ? 25 : 35 
          }]}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: '60%',
            right: '5%',
            transform: [
              {
                translateY: floatingAnim4.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={[styles.floatingDiamond, { 
            width: isPhone ? 40 : 55, 
            height: isPhone ? 40 : 55, 
            borderRadius: isPhone ? 20 : 27 
          }]}
        />
      </Animated.View>
    </View>
  );

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <Animated.View style={{ opacity: fadeAnim }}>
          <MaterialCommunityIcons
            name="gamepad-variant"
            size={isPhone ? 50 : 60}
            color={isDark ? '#fff' : '#667eea'}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {renderBackground()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: dimensions.sectionSpacing }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[
            styles.backButton,
            isDark && styles.backButtonDark,
            {
              top: Platform.OS === 'ios' ? 50 : 30,
              left: dimensions.containerPadding,
              width: dimensions.smallButtonSize,
              height: dimensions.smallButtonSize,
              borderRadius: dimensions.smallButtonSize / 2
            }
          ]}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={isPhone ? 16 : 20}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[
            styles.themeButton,
            isDark && styles.themeButtonDark,
            {
              top: Platform.OS === 'ios' ? 50 : 30,
              right: dimensions.containerPadding,
              width: dimensions.smallButtonSize,
              height: dimensions.smallButtonSize,
              borderRadius: dimensions.smallButtonSize / 2
            }
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={isPhone ? 16 : 20}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        <View style={{ paddingTop: Platform.OS === 'ios' ? 100 : 80 }}>
          {renderHeader()}
          
          {!currentGame && renderGameSelection()}
          {currentGame === 'quiz' && renderQuizGame()}
          {currentGame === 'sorting' && renderSortingGame()}
        </View>
      </Animated.ScrollView>
      
      {/* Points confirmation modal (now unused for game start, but kept for reference) */}
      {renderPointsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0f0f23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingContainerDark: {
    backgroundColor: '#0f0f23',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingElement: {
    position: 'absolute',
    opacity: 0.1,
  },
  floatingCircle: {
    borderRadius: 40,
  },
  floatingSquare: {
    borderRadius: 12,
  },
  floatingTriangle: {
    borderRadius: 35,
  },
  floatingDiamond: {
    borderRadius: 27,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonDark: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
  },
  themeButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  themeButtonDark: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
  },
  headerSection: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pageTitleDark: {
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  pageSubtitleDark: {
    color: '#b0b0b0',
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsDisplayDark: {
    backgroundColor: 'rgba(78, 204, 163, 0.1)',
    borderColor: 'rgba(78, 204, 163, 0.2)',
    shadowColor: '#4ecca3',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: -0.1,
  },
  pointsTextDark: {
    color: '#4ecca3',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    minWidth: 80,
  },
  statCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  statValueDark: {
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  statLabelDark: {
    color: '#b0b0b0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  gamesContainer: {
    alignItems: 'center',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  gameCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  gameTitleDark: {
    color: '#ffffff',
  },
  gameDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  gameDescriptionDark: {
    color: '#b0b0b0',
  },
  gameCost: {
    fontSize: 12,
    fontWeight: '500',
    color: '#667eea',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  gameCostDark: {
    color: '#4ecca3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    maxWidth: 400,
    width: '90%',
  },
  modalContainerDark: {
    backgroundColor: '#1a1a2e',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalTitleDark: {
    color: '#ffffff',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  modalTextDark: {
    color: '#b0b0b0',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonCancelDark: {
    backgroundColor: '#2a2a3e',
    borderColor: '#444',
  },
  modalButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  modalButtonTextCancel: {
    color: '#666',
  },
  modalButtonTextCancelDark: {
    color: '#b0b0b0',
  },
  quizContainer: {
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  questionCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  questionInfo: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  questionNumberDark: {
    color: '#b0b0b0',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.2,
  },
  questionTextDark: {
    color: '#ffffff',
  },
  optionsContainer: {
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  optionCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCorrect: {
    borderColor: '#43e97b',
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
  },
  optionIncorrect: {
    borderColor: '#f5576c',
    backgroundColor: 'rgba(245, 87, 108, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
    letterSpacing: -0.1,
  },
  optionTextDark: {
    color: '#ffffff',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  explanationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  explanationCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    letterSpacing: -0.2,
  },
  explanationTitleDark: {
    color: '#ffffff',
  },
  explanationText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    letterSpacing: -0.1,
  },
  explanationTextDark: {
    color: '#b0b0b0',
  },
  nextButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  sortingContainer: {
    alignItems: 'center',
  },
  currentItemContainer: {
    alignItems: 'center',
  },
  currentItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  currentItemCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentItemIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  currentItemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  currentItemNameDark: {
    color: '#ffffff',
  },
  currentItemProgress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  currentItemProgressDark: {
    color: '#b0b0b0',
  },
  binsContainer: {
    width: '100%',
  },
  binsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  binCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  binCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  binCardSelected: {
    borderColor: '#43e97b',
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  binIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  binLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  binLabelDark: {
    color: '#ffffff',
  },
  gameCompleteContainer: {
    alignItems: 'center',
  },
  gameCompleteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  gameCompleteCardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameCompleteTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  gameCompleteTitleDark: {
    color: '#ffffff',
  },
  gameCompleteText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  gameCompleteTextDark: {
    color: '#b0b0b0',
  },
  restartButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  restartButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
});
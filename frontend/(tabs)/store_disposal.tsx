// When the model classifes the item as StoreDropOff (for items like LDPE bags), it brings the user to this screen
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Responsive breakpoints
const isSmallScreen = width < 380;
const isMediumScreen = width >= 380 && width < 768;
const isLargeScreen = width >= 768;

// Tips for store drop-off items
const storeDropOffTips = [
  {
    title: "Check Store Policies",
    description: "Call ahead or check their website to confirm different retailers accept your specific item.",
    icon: "checkmark-circle-outline",
    color: "#f57c00"
  },
  {
    title: "Prepare Items Properly",
    description: "Clean containers, and separate different materials as required by the store's recycling program.",
    icon: "construct-outline",
    color: "#ff8f00"
  },
  {
    title: "Bring Original Packaging",
    description: "Some stores require items to be in original packaging for proper identification and processing.",
    icon: "cube-outline",
    color: "#ff6f00"
  },
  {
    title: "Consider Bulk Drop-offs",
    description: "Collect many items before visiting to make your trip more efficient.",
    icon: "layers-outline",
    color: "#e65100"
  }
];

// Fun facts about store recycling programs
const funFacts = [
  "Major retailers like Best Buy accept over 95% of electronic devices for recycling, regardless of where you bought them.",
  "Store drop-off programs divert millions of pounds of waste from landfills each year through specialized recycling partnerships.",
  "Many retailers offer trade-in credits or discounts when you bring in old items for recycling.",
  "Store recycling programs often have better processing capabilities than municipal recycling centers.",
  "Some items like ink cartridges and cell phones can be recycled indefinitely through store programs."
];

// Common store drop-off categories
const storeCategories = [
  {
    name: "Plastic Bags / Amazon Delivery Bags",
    stores: ["Target", "Walmart", "Grocery stores"],
    items: ["Shopping bags", "Bread bags", "Dry cleaning bags"],
    icon: "bag-outline",
    color: "#e65100"
  }
];

export default function StoreDisposal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isGuestSession = params.guest === 'true';
  const itemName = params.item || "this item";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  
  // For confetti effect
  const [showConfetti, setShowConfetti] = useState(true);
  const confettiAnims = useRef(Array(20).fill(0).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-20),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1)
  }))).current;

  // For tip cards animation
  const [visibleTips, setVisibleTips] = useState<number[]>([]);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const tipAnims = useRef(storeDropOffTips.map(() => new Animated.Value(0))).current;
  const tipExpandAnims = useRef(storeDropOffTips.map(() => new Animated.Value(0))).current;

  // For category cards animation
  const [visibleCategories, setVisibleCategories] = useState<number[]>([]);
  const categoryAnims = useRef(storeCategories.map(() => new Animated.Value(0))).current;

  // For fun fact rotation
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const factAnim = useRef(new Animated.Value(1)).current;
  const factSwipeAnim = useRef(new Animated.Value(0)).current;
  
  // For button animations
  const mapButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const homeButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;

  // For scroll-based animations
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate header on mount
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
    
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Animate confetti with yellow/orange colors
    if (showConfetti) {
      confettiAnims.forEach((anim, i) => {
        const duration = 2000 + Math.random() * 3000;
        
        Animated.parallel([
          Animated.timing(anim.y, {
            toValue: height * 0.4,
            duration,
            easing: Easing.bezier(0.215, 0.61, 0.355, 1),
            useNativeDriver: true
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 360,
            duration,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration,
            delay: duration * 0.7,
            useNativeDriver: true
          })
        ]).start(() => {
          if (i === 0) {
            setTimeout(() => setShowConfetti(false), 1000);
          }
        });
      });
    }

    // Staggered animation for tips
    const showTips = () => {
      const animateTip = (index: number) => {
        if (index >= storeDropOffTips.length) return;

        setTimeout(() => {
          setVisibleTips(prev => [...prev, index]);

          Animated.spring(tipAnims[index], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();

          animateTip(index + 1);
        }, 200);
      };

      animateTip(0);
    };

    // Staggered animation for categories
    const showCategories = () => {
      const animateCategory = (index: number) => {
        if (index >= storeCategories.length) return;

        setTimeout(() => {
          setVisibleCategories(prev => [...prev, index]);

          Animated.spring(categoryAnims[index], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();

          animateCategory(index + 1);
        }, 150);
      };

      setTimeout(() => animateCategory(0), 1000); // Start after tips
    };

    showTips();
    showCategories();

    // Rotate fun facts every 8 seconds
    const factInterval = setInterval(() => {
      animateFactChange((currentFactIndex + 1) % funFacts.length);
    }, 8000);

    return () => clearInterval(factInterval);
  }, []); 

  const animateFactChange = (newIndex: number) => {
    Animated.sequence([
      Animated.timing(factSwipeAnim, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(factSwipeAnim, {
        toValue: width,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentFactIndex(newIndex);
      
      Animated.timing(factSwipeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFindStores = () => {
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.sequence([
      Animated.timing(mapButtonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(mapButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    // When user clicks find nearest stores button, it opens google maps from the below link to find stores that accept these types of bags (prolly LDPE)
    const searchQuery = "stores that accept plastic bags for recycling near me";
    if (isWeb) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`);
    } else {
      const mapsUrl = Platform.select({
        ios: `maps://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`,
        android: `geo:0,0?q=${encodeURIComponent(searchQuery)}`,
      });
      if (mapsUrl) Linking.openURL(mapsUrl);
    }
  };

  const handleBackPress = () => {
    if (isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.sequence([
      Animated.timing(backButtonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(backButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    router.push('/next_page');
  };
  
  const handleHomePress = () => {
    if (isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Animated.sequence([
      Animated.timing(homeButtonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(homeButtonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    router.push({ pathname: '/account', params: { guest: 'true' } });
  };
  
  const handleTipPress = (index: number) => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    if (expandedTip === index) {
      Animated.timing(tipExpandAnims[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setExpandedTip(null);
      });
    } else {
      if (expandedTip !== null) {
        Animated.timing(tipExpandAnims[expandedTip], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start();
      }
      
      setExpandedTip(index);
      Animated.timing(tipExpandAnims[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  const handlePrevFact = () => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    const newIndex = currentFactIndex === 0 ? funFacts.length - 1 : currentFactIndex - 1;
    animateFactChange(newIndex);
  };
  
  const handleNextFact = () => {
    if (isWeb) {
      Haptics.selectionAsync();
    }
    
    const newIndex = (currentFactIndex + 1) % funFacts.length;
    animateFactChange(newIndex);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });
  
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.3],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: headerFadeAnim,
            shadowOpacity: headerShadowOpacity
          }
        ]}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.headerGradient}
        >
          <Animated.View
            style={{
              transform: [{ scale: backButtonScaleAnim }]
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#f39c12" />
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.headerTitle}>Store Drop-Off Guide</Text>
          
          <View style={styles.headerRightPlaceholder} />
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Confetti effect with yellow/orange colors */}
          {showConfetti && confettiAnims.map((anim, index) => (
            <Animated.View
              key={`confetti-${index}`}
              style={[
                styles.confettiPiece,
                {
                  left: anim.x,
                  transform: [
                    { translateY: anim.y },
                    { rotate: anim.rotate.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ],
                  opacity: anim.opacity,
                  backgroundColor: index % 5 === 0 ? '#f39c12' : 
                                  index % 5 === 1 ? '#e67e22' : 
                                  index % 5 === 2 ? '#f57c00' : 
                                  index % 5 === 3 ? '#ff8f00' : 
                                  '#ff6f00'
                }
              ]}
            />
          ))}
          
          <LinearGradient
            colors={['#2d2d2d', '#3d3d3d']}
            style={styles.heroGradient}
          >
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#f39c12', '#e67e22']}
                style={styles.iconGradient}
              >
                <Ionicons name="storefront-outline" size={60} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.heroTitle}>
              Take this item to a store.
            </Text>

            <Text style={styles.heroSubtitle}>
              {itemName} requires special handling through retail drop-off programs.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Main guidance */}
        <Animated.View
          style={[
            styles.binGuidance,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            style={styles.binGradient}
          >
            <View style={styles.binIconContainer}>
              <Ionicons name="storefront" size={36} color="#fff" />
            </View>

            <View style={styles.binTextContainer}>
              <Text style={styles.binTitle}>Visit Participating Retailers</Text>
              <Text style={styles.binDescription}>
                Many stores offer specialized recycling programs for items that can't be processed through regular recycling.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Store categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Common Store Programs</Text>

          {storeCategories.map((category, index) => (
            visibleCategories.includes(index) && (
              <Animated.View
                key={index}
                style={[
                  styles.categoryCard,
                  {
                    opacity: categoryAnims[index],
                    transform: [
                      {
                        scale: categoryAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      },
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#3d3d3d', '#4d4d4d']}
                  style={styles.categoryGradient}
                >
                  <View style={[
                    styles.categoryIconContainer,
                    { backgroundColor: `${category.color}20` }
                  ]}>
                    <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={32} color={category.color} />
                  </View>

                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <Text style={styles.categoryStores}>
                      Stores: {category.stores.join(', ')}
                    </Text>
                    <Text style={styles.categoryItems}>
                      Items: {category.items.join(', ')}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )
          ))}
        </View>

        {/* Disposal tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Preparation Tips</Text>

          {storeDropOffTips.map((tip, index) => (
            visibleTips.includes(index) && (
              <Animated.View
                key={index}
                style={[
                  styles.tipCard,
                  {
                    opacity: tipAnims[index],
                    transform: [
                      {
                        scale: tipAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      },
                    ],
                    shadowOpacity: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.2]
                    }),
                    shadowRadius: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [5, 10]
                    }),
                    elevation: tipExpandAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 5]
                    })
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleTipPress(index)}
                  style={styles.tipTouchable}
                >
                  <LinearGradient
                    colors={['#3d3d3d', '#4d4d4d']}
                    style={styles.tipGradient}
                  >
                    <View style={styles.tipHeader}>
                      <View style={[
                        styles.tipIconContainer,
                        { backgroundColor: `${tip.color}20` }
                      ]}>
                        <Ionicons name={tip.icon as keyof typeof Ionicons.glyphMap} size={28} color={tip.color} />
                      </View>

                      <View style={styles.tipTextContainer}>
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                        <Animated.View
                          style={{
                            height: tipExpandAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 80]
                            }),
                            overflow: 'hidden'
                          }}
                        >
                          <Text style={styles.tipDescription}>{tip.description}</Text>
                        </Animated.View>
                      </View>
                      
                      <Animated.View
                        style={{
                          transform: [{
                            rotate: tipExpandAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg']
                            })
                          }]
                        }}
                      >
                        <Ionicons 
                          name="chevron-down" 
                          size={20} 
                          color="#bbb" 
                        />
                      </Animated.View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )
          ))}
        </View>

        {/* Did you know section */}
        <View style={styles.factSection}>
          <Text style={styles.sectionTitle}>Did You Know?</Text>

          <View style={styles.factCardContainer}>
            <TouchableOpacity
              style={styles.factNavButton}
              onPress={handlePrevFact}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#bbb" />
            </TouchableOpacity>
            
            <Animated.View
              style={[
                styles.factCard,
                {
                  transform: [{ translateX: factSwipeAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['#3d3d3d', '#4d4d4d']}
                style={styles.factGradient}
              >
                <Ionicons name="bulb-outline" size={24} color="#f39c12" style={styles.factIcon} />
                <Text style={styles.factText}>{funFacts[currentFactIndex]}</Text>
                
                <View style={styles.factIndicators}>
                  {funFacts.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.factIndicator,
                        currentFactIndex === i ? styles.factIndicatorActive : {}
                      ]} 
                    />
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>
            
            <TouchableOpacity
              style={styles.factNavButton}
              onPress={handleNextFact}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#bbb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store locator */}
        <View style={styles.dropOffSection}>
          <Text style={styles.sectionTitle}>Find Participating Stores</Text>

          <Animated.View
            style={{
              transform: [{ scale: mapButtonScaleAnim }]
            }}
          >
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleFindStores}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f39c12', '#e67e22']}
                style={styles.mapButtonGradient}
              >
                <Ionicons name="location" size={24} color="#fff" style={styles.mapButtonIcon} />
                <Text style={styles.mapButtonText}>Find Recycling Stores Near Me</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.dropOffNote}>
            Call ahead to confirm acceptance policies and operating hours. Some stores may have specific requirements for item condition or quantity.
          </Text>
        </View>
        
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Bottom action button */}
      <View style={styles.bottomBar}>
        <Animated.View
          style={{
            transform: [{ scale: homeButtonScaleAnim }]
          }}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleHomePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f39c12', '#e67e22']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Back to Home</Text>
              <Ionicons name="home" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 50,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    position: 'relative',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  binGuidance: {
    marginHorizontal: 15,
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  binGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  binIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  binTextContainer: {
    flex: 1,
  },
  binTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  binDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  categoriesSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  categoryCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  categoryStores: {
    fontSize: 13,
    color: '#f39c12',
    marginBottom: 2,
    fontWeight: '500',
  },
  categoryItems: {
    fontSize: 12,
    color: '#bbb',
    lineHeight: 16,
  },
  tipsSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  tipCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  tipTouchable: {
    width: '100%',
  },
  tipGradient: {
    padding: 15,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
    marginTop: 5,
  },
  factSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  factCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  factCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
    marginHorizontal: -20,
    zIndex: 1,
  },
  factGradient: {
    padding: 20,
    alignItems: 'center',
  },
  factIcon: {
    marginBottom: 15,
  },
  factText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 15,
  },
  factIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  factIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
    marginHorizontal: 4,
  },
  factIndicatorActive: {
    backgroundColor: '#f39c12',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropOffSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  mapButton: {
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  mapButtonIcon: {
    marginRight: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dropOffNote: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

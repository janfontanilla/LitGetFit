import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { Menu, X, Home, Dumbbell, Utensils, User, Zap, Calendar, TrendingUp, Settings, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';

const { width } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  route: string;
  badge?: number;
  isNew?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    title: 'Dashboard',
    icon: Home,
    route: '/(tabs)',
  },
  {
    id: 'routines',
    title: 'Workouts',
    icon: Dumbbell,
    route: '/(tabs)/routines',
  },
  {
    id: 'ai-coach',
    title: 'AI Coach',
    icon: Zap,
    route: '/(tabs)/ai-coach',
    isNew: true,
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    icon: Utensils,
    route: '/(tabs)/nutrition',
  },
];

const secondaryItems: NavigationItem[] = [
  {
    id: 'calendar',
    title: 'Schedule',
    icon: Calendar,
    route: '/schedule',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    route: '/(tabs)/profile',
  },
];

export default function ResponsiveNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(width < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const slideAnim = new Animated.Value(-300);

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.postMessage({ type: 'nav-collapse', isCollapsed }, '*');
    }
  }, [isCollapsed]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < 768);
      if (window.width >= 768) {
        setIsMenuOpen(false);
      }
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const handleNavigation = (route: string) => {
    router.push(route as any);
    setIsMenuOpen(false);
  };

  const isActiveRoute = (route: string) => {
    const processedRoute = route.replace('/(tabs)', '');
    // Handle dashboard route, which becomes an empty string
    if (processedRoute === '') {
      return pathname === '/';
    }
    // Handle other routes
    return pathname.startsWith(processedRoute);
  };

  const renderNavigationItem = (item: NavigationItem, isSecondary = false) => {
    const isActive = isActiveRoute(item.route);
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.navItem,
          isActive && styles.navItemActive,
          isSecondary && styles.secondaryNavItem,
        ]}
        onPress={() => handleNavigation(item.route)}
        activeOpacity={0.7}
      >
        <View style={styles.navItemContent}>
          <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
            <IconComponent 
              size={20} 
              color={isActive ? AppColors.textPrimary : AppColors.textSecondary}
              strokeWidth={isActive ? 2.5 : 2}
            />
            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          {!isCollapsed && (
            <Text style={[
              styles.navItemText,
              isActive && styles.navItemTextActive,
              isSecondary && styles.secondaryNavItemText,
            ]}>
              {item.title}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!isMobile) {
    const desktopContainerStyle = [
      styles.desktopContainer,
      isCollapsed ? styles.desktopContainerCollapsed : styles.desktopContainerExpanded,
    ];

    return (
      <View style={desktopContainerStyle}>
        <BlurView intensity={20} tint="dark" style={styles.desktopNav}>
          <View style={styles.desktopContent}>
            <View style={[styles.brand, isCollapsed && styles.brandCollapsed]}>
              <Zap size={28} color={AppColors.primary} />
              {!isCollapsed && <Text style={styles.brandText}>LitGetFit</Text>}
            </View>

            <View style={styles.desktopNavItems}>
              {navigationItems.map(item => renderNavigationItem(item))}
            </View>

            <View style={styles.desktopSecondary}>
              {secondaryItems.map(item => renderNavigationItem(item, true))}
            </View>

            <TouchableOpacity
              style={[styles.collapseButton, isCollapsed && styles.collapseButtonCollapsed]}
              onPress={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight size={20} color={AppColors.textSecondary} />
              ) : (
                <ChevronLeft size={20} color={AppColors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  }

  // Mobile Navigation
  return (
    <>
      {/* Mobile Header */}
      <SafeAreaView style={styles.mobileHeader}>
        <BlurView intensity={20} tint="dark" style={styles.mobileHeaderContent}>
          <View style={styles.mobileHeaderInner}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
              activeOpacity={0.7}
            >
              {isMenuOpen ? (
                <X size={24} color={AppColors.textPrimary} />
              ) : (
                <Menu size={24} color={AppColors.textPrimary} />
              )}
            </TouchableOpacity>

            <View style={styles.mobileBrand}>
              <Zap size={24} color={AppColors.primary} />
              <Text style={styles.mobileBrandText}>Lit Get Fit</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerAction}>
                <User size={20} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </SafeAreaView>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            onPress={() => setIsMenuOpen(false)}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.mobileMenu,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <BlurView intensity={40} tint="dark" style={styles.mobileMenuContent}>
              <SafeAreaView style={styles.mobileMenuSafe}>
                {/* Menu Header */}
                <View style={styles.mobileMenuHeader}>
                  <View style={styles.mobileBrand}>
                    <Zap size={28} color={AppColors.primary} />
                    <Text style={styles.brandText}>Lit Get Fit</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    <X size={24} color={AppColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <ScrollView style={styles.mobileMenuScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.mobileMenuSection}>
                    <Text style={styles.menuSectionTitle}>Main</Text>
                    {navigationItems.map(item => renderNavigationItem(item))}
                  </View>

                  <View style={styles.mobileMenuSection}>
                    <Text style={styles.menuSectionTitle}>More</Text>
                    {secondaryItems.map(item => renderNavigationItem(item, true))}
                  </View>
                </ScrollView>

                {/* Menu Footer */}
                <View style={styles.mobileMenuFooter}>
                  <Text style={styles.footerText}>Version 1.0.0</Text>
                </View>
              </SafeAreaView>
            </BlurView>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Desktop Styles
  desktopContainer: {
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
      default: {
        position: 'absolute',
      },
    }),
  },
  desktopContainerExpanded: {
    width: 260,
  },
  desktopContainerCollapsed: {
    width: 90,
  },
  desktopNav: {
    flex: 1,
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    borderRightWidth: 1,
    borderRightColor: AppColors.border,
  },
  desktopContent: {
    flex: 1,
    paddingVertical: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  brandCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  desktopNavItems: {
    flex: 1,
    paddingHorizontal: 16,
  },
  desktopSecondary: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  collapseButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  collapseButtonCollapsed: {
    right: 'auto',
    left: '50%',
    transform: [{ translateX: -18 }],
  },

  // Mobile Styles
  mobileHeader: {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
      default: {
        position: 'absolute',
      },
    }),
  },
  mobileHeaderContent: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  mobileHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
    padding: 4,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBrandText: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    padding: 4,
  },

  // Mobile Menu
  overlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
      default: {
        position: 'absolute',
      },
    }),
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
  },
  mobileMenuContent: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
  },
  mobileMenuSafe: {
    flex: 1,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  closeButton: {
    padding: 4,
  },
  mobileMenuScroll: {
    flex: 1,
  },
  mobileMenuSection: {
    paddingVertical: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  mobileMenuFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },

  // Navigation Items
  navItem: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: AppColors.primary,
  },
  secondaryNavItem: {
    opacity: 0.8,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    // Additional styling for active state if needed
  },
  navItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.textSecondary,
    flex: 1,
  },
  navItemTextActive: {
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  secondaryNavItemText: {
    fontSize: 14,
  },

  // Badges
  newBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: AppColors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: AppColors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
});
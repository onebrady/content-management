import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import {
  navigationConfig,
  quickActions,
  dashboardStats,
  filterNavigationByRole,
} from '@/lib/navigation';

export function useNavigation() {
  const { user } = useAuth();

  const filteredNavigation = useMemo(() => {
    try {
      return filterNavigationByRole(navigationConfig, user?.role);
    } catch (error) {
      console.error('useNavigation: Error filtering navigation:', error);
      return [];
    }
  }, [user?.role]);

  const userQuickActions = useMemo(() => {
    try {
      return quickActions.filter((action) =>
        action.roles.includes(user?.role || '')
      );
    } catch (error) {
      console.error('useNavigation: Error filtering quick actions:', error);
      return [];
    }
  }, [user?.role]);

  const userDashboardStats = useMemo(
    () => {
      try {
        return dashboardStats.map((stat) => ({
          ...stat,
          value: '0', // This will be updated by the component using analytics
        }));
      } catch (error) {
        console.error('useNavigation: Error mapping dashboard stats:', error);
        return [];
      }
    },
    [] // Empty dependency array since dashboardStats is static
  );

  return {
    navigation: filteredNavigation,
    quickActions: userQuickActions,
    dashboardStats: userDashboardStats,
    userRole: user?.role,
  };
}

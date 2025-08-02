import { useAuth } from '@/hooks/useAuth';
import {
  navigationConfig,
  quickActions,
  dashboardStats,
  filterNavigationByRole,
} from '@/lib/navigation';

export function useNavigation() {
  const { user } = useAuth();

  const filteredNavigation = filterNavigationByRole(
    navigationConfig,
    user?.role
  );

  const userQuickActions = quickActions.filter((action) =>
    action.roles.includes(user?.role || '')
  );

  const userDashboardStats = dashboardStats.map((stat) => ({
    ...stat,
    value: '0', // This will be updated by the component using analytics
  }));

  return {
    navigation: filteredNavigation,
    quickActions: userQuickActions,
    dashboardStats: userDashboardStats,
    userRole: user?.role,
  };
}

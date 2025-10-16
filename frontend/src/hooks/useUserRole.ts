import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'organizer' | 'student';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching user role from backend...');
      
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/userRole', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ User role fetched:', result.data.role);
          setUserRole(result.data.role.trim() as UserRole);
        } else {
          console.log('❌ Failed to get user role:', result.error);
          setUserRole('student'); // Default to student
        }
      } else {
        console.log('❌ HTTP error getting user role:', response.status);
        setUserRole('student'); // Default to student
      }
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      setUserRole('student'); // Default to student if error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const isOrganizer = userRole === 'organizer' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  return { userRole, isOrganizer, isAdmin, loading, refetch: fetchUserRole };
};

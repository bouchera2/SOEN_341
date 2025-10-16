import { db } from '../database/firestore.js';
import { UserRole } from '../types/index.js';

export interface UserRoleData {
  role: UserRole;
  uid: string;
  email?: string;
}

/**
 * Fetches user role from Firestore
 * @param uid - User ID from Firebase Auth
 * @returns Promise<UserRoleData | null>
 */
export const getUserRole = async (uid: string): Promise<UserRoleData | null> => {
  try {
    console.log('🔍 Fetching user role for UID:', uid);
    
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found in Firestore');
      return null;
    }
    
    const userData = userDoc.data();
    if (!userData) {
      console.log('❌ User data is null');
      return null;
    }
    
    const role = (userData.role as string)?.trim() as UserRole;
    console.log('✅ User role found:', role);
    
    return {
      role: role || 'student', // Default to student if no role is set
      uid,
      email: userData.email
    };
  } catch (error) {
    console.error('❌ Error fetching user role:', error);
    return null;
  }
};

/**
 * Updates user role in Firestore
 * @param uid - User ID
 * @param role - New role to set
 * @returns Promise<boolean>
 */
export const updateUserRole = async (uid: string, role: UserRole): Promise<boolean> => {
  try {
    console.log('🔄 Updating user role:', { uid, role });
    
    await db.collection('users').doc(uid).update({
      role,
      updatedAt: new Date()
    });
    
    console.log('✅ User role updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return false;
  }
};

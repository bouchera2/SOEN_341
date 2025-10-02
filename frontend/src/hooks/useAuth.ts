import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';


const onSignInSuccess = async (user: User) => {
  try {
    const token = await user.getIdToken();
    

   const response = await fetch("http://localhost:3002/auth/sync", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    console.log(data);
  } catch (error) {
    console.error("Error syncing user with backend:", error);
  }
};

const onSignUpSuccess = async (user: User) => {
  try {
    const token = await user.getIdToken();
    
    
    await fetch("http://localhost:4000/auth/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ defaultRole: "user", isNewUser: true }),
    });
    
    console.log("New user created and synced with backend");
  } catch (error) {
    console.error("Error syncing new user with backend:", error);
  }
};

const onSignOutSuccess = () => {
  console.log("User signed out successfully");
  // You can add cleanup logic here if needed
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await onSignInSuccess(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await onSignUpSuccess(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await onSignInSuccess(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      onSignOutSuccess();
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };
}

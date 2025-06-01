import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebaseConfig';

class AuthService {
  // Register new user
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return auth.currentUser !== null;
  }

  // Google Sign In (placeholder - requires additional setup for mobile)
  async signInWithGoogle() {
    try {
      // Note: For mobile apps, you'd need @react-native-google-signin/google-signin
      // This is a placeholder for the structure
      console.log('Google sign-in requires additional mobile setup');
      return { success: false, error: 'Google sign-in not implemented for mobile' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService(); 
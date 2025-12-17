import { DataStore } from './dataStore';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const AUTH_KEY = 'focuspilot_auth_session';

export const AuthService = {
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(AUTH_KEY);
    return session ? JSON.parse(session) : null;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem('focuspilot_users') || '[]');
    let user = users.find((u: any) => u.email === email);
    
    if (!user) {
      throw new Error("Invalid credentials. Please register first.");
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  loginWithGoogle: async (): Promise<User> => {
    // In production, trigger Google OAuth 2.0 flow here
    await new Promise(resolve => setTimeout(resolve, 1200));
    const googleUser: User = {
      id: 'google_' + crypto.randomUUID(),
      email: 'pilot.demo@gmail.com',
      name: 'Google Pilot',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(googleUser));
    return googleUser;
  },

  register: async (name: string, email: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('focuspilot_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error("Email already registered.");
    }

    const newUser: User = { id: crypto.randomUUID(), name, email };
    users.push(newUser);
    localStorage.setItem('focuspilot_users', JSON.stringify(users));
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  }
};
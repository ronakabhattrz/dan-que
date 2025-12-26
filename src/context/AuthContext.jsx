import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default admin account for demo purposes
const DEFAULT_ADMIN = {
  id: 'admin-1',
  email: 'admin@example.com',
  password: 'admin123', // In production, this should be hashed
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const AuthProvider = ({ children }) => {
  // Initialize users with default admin
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    const parsedUsers = saved ? JSON.parse(saved) : [];
    
    // Ensure default admin exists
    const hasAdmin = parsedUsers.some(u => u.email === DEFAULT_ADMIN.email);
    if (!hasAdmin) {
      return [...parsedUsers, DEFAULT_ADMIN];
    }
    return parsedUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const signup = (name, email, password) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this should be hashed
      role: 'user',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    
    // Auto-login after signup
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    
    return userWithoutPassword;
  };

  const login = (email, password, role = 'user') => {
    const user = users.find(u => u.email === email && u.role === role);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Don't store password in current user
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    
    return userWithoutPassword;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const isUser = () => {
    return currentUser?.role === 'user';
  };

  const value = {
    currentUser,
    users,
    signup,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

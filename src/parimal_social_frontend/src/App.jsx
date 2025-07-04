import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../declarations/parimal_social_backend';
import { canisterId } from '../../declarations/parimal_social_backend';
import Login from './components/Login';
import CreateProfile from './components/CreateProfile';
import Dashboard from './components/Dashboard';
import './index.css';

const App = () => {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        await handleAuthenticated(client);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const handleAuthenticated = async (client) => {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();

    setIdentity(identity);
    setIsAuthenticated(true);
    setPrincipal(principal);

    const backendActor = createActor(canisterId, {
      agentOptions: { identity }
    });
    setActor(backendActor);

    try {
      const result = await backendActor.get_current_user();
      const currentUser = Array.isArray(result) ? result[0] : result;
      console.log('🔍 get_current_user response:', currentUser);

      if (currentUser && currentUser.user_principal) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }

    setLoading(false);
  };

  const handleLogin = async () => {
    if (!authClient) return;

    try {
      setLoading(true);

      await authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app/#authorize'
            : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/#authorize`,
        onSuccess: () => {
          handleAuthenticated(authClient);
        },
        onError: (error) => {
          console.error('Login error:', error);
          setLoading(false);
        },
        redirectUri: window.location.origin,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
      });
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!authClient) return;

    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal(null);
    setActor(null);
    setUser(null);
  };

  const handleProfileCreated = async () => {
    try {
      const result = await actor.get_current_user();
      const currentUser = Array.isArray(result) ? result[0] : result;
  
      console.log('✅ After profile creation, get_current_user:', result);
      if (currentUser && currentUser.user_principal) {
        setUser(currentUser); // This will switch to Dashboard
      } else {
        console.warn('Profile creation succeeded but get_current_user returned invalid:', result);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error after profile creation in get_current_user():', error);
    }
  };
  
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!user) {
    return (
      <CreateProfile
        actor={actor}
        principal={principal}
        onProfileCreated={handleProfileCreated}
      />
    );
  }

  return (
    <Dashboard
      actor={actor}
      user={user}
      principal={principal}
      onLogout={handleLogout}
      onUserUpdate={setUser}
    />
  );
};

export default App;
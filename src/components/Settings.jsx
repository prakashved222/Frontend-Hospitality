import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // Session information
  const [sessionStartTime, setSessionStartTime] = useState(new Date());
  
  // App preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'english',
    fontSize: 'medium'
  });
  
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    fetchUserData();
    
    // Get session start time from localStorage or use current time
    const loginTime = localStorage.getItem('sessionStartTime');
    if (loginTime) {
      setSessionStartTime(new Date(parseInt(loginTime)));
    } else {
      // If no login time stored, set current time and store it
      const currentTime = new Date();
      localStorage.setItem('sessionStartTime', currentTime.getTime().toString());
      setSessionStartTime(currentTime);
    }
  }, []);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || 
        (localStorage.getItem('userInfo') ? 
          JSON.parse(localStorage.getItem('userInfo')).token : '');
      
      if (!token) {
        toast.error('You need to be logged in');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Determine the appropriate endpoint based on user role
      let endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/profile';
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (storedUserInfo.role === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/profile';
      } else if (storedUserInfo.role === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/profile';
      }
      
      const { data } = await axios.get(endpoint, config);
      
      // Update state with user data
      setUserInfo(data);
      setResetEmail(data.email); // Pre-populate email for reset
      
      // Set preferences if available in the API response
      if (data.preferences) {
        setPreferences({
          theme: data.preferences.theme || 'light',
          language: data.preferences.language || 'english',
          fontSize: data.preferences.fontSize || 'medium'
        });
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.response?.data?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || 
        (localStorage.getItem('userInfo') ? 
          JSON.parse(localStorage.getItem('userInfo')).token : '');
      
      if (!token) {
        toast.error('You need to be logged in');
        return;
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Get user role to determine the correct endpoint
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userRole = userInfo.role || '';
      
      // Use the correct API endpoint based on user role
      let endpoint = '';
      if (userRole === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/change-password';
      } else if (userRole === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/change-password';
      } else {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/change-password';
      }
      
      console.log('Using endpoint:', endpoint); // Add this for debugging
      
      const { data } = await axios.put(endpoint, {
        currentPassword,
        newPassword
      }, config);
      
      // Update stored user info if token changed
      if (data && data.token) {
        const updatedUserInfo = {
          ...userInfo,
          token: data.token
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Determine the appropriate endpoint based on user role
      let endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/request-reset';
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (storedUserInfo.role === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/request-reset';
      } else if (storedUserInfo.role === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/request-reset';
      }
      
      await axios.post(endpoint, { email: resetEmail });
      
      setResetSent(true);
      toast.success('Reset code sent to your email address');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine the appropriate endpoint based on user role
      let endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/reset-password';
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (storedUserInfo.role === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/reset-password';
      } else if (storedUserInfo.role === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/reset-password';
      }
      
      const { data } = await axios.post(endpoint, {
        email: resetEmail,
        resetCode,
        newPassword
      });
      
      // Update stored user info
      if (data && data.token) {
        const updatedUserInfo = {
          ...storedUserInfo,
          token: data.token
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
      
      // Clear password fields and reset form state
      setNewPassword('');
      setConfirmPassword('');
      setResetCode('');
      setForgotPasswordMode(false);
      setResetSent(false);
      
      toast.success('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please check your reset code.');
    } finally {
      setLoading(false);
    }
  };
  
  const savePreferences = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || 
        (localStorage.getItem('userInfo') ? 
          JSON.parse(localStorage.getItem('userInfo')).token : '');
      
      if (!token) {
        toast.error('You need to be logged in');
        return;
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      // Determine the appropriate endpoint based on user role
      let endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/preferences';
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (storedUserInfo.role === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/preferences';
      } else if (storedUserInfo.role === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/preferences';
      }
      
      const { data } = await axios.put(endpoint, {
        preferences: {
          theme: preferences.theme,
          language: preferences.language,
          fontSize: preferences.fontSize
        }
      }, config);
      
      // Update local storage if needed
      if (data && data.preferences) {
        const updatedUserInfo = {
          ...storedUserInfo,
          preferences: data.preferences
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
      
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      const token = localStorage.getItem('token') || 
        (localStorage.getItem('userInfo') ? 
          JSON.parse(localStorage.getItem('userInfo')).token : '');
      
      if (!token) {
        toast.error('You need to be logged in');
        return;
      }
      
      setLoading(true);
      
      // Determine the appropriate endpoint based on user role
      let endpoint = 'https://hospitality-management-1h5k.onrender.com/auth/logout-all';
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      if (storedUserInfo.role === 'doctor') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/doctors/logout-all';
      } else if (storedUserInfo.role === 'patient') {
        endpoint = 'https://hospitality-management-1h5k.onrender.com/patients/logout-all';
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(endpoint, {}, config);
      
      // Clear local storage and redirect to login
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userType');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionStartTime');
      
      toast.success('Signed out from all devices');
      
      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = `/${storedUserInfo.role.toLowerCase()}`;
      }, 1000);
      
    } catch (error) {
      console.error('Error signing out from all devices:', error);
      toast.error(error.response?.data?.message || 'Failed to sign out from all devices');
    } finally {
      setLoading(false);
    }
  };
  
  const switchToForgotMode = () => {
    setForgotPasswordMode(true);
    setResetSent(false);
  };
  
  const switchToNormalMode = () => {
    setForgotPasswordMode(false);
    setResetSent(false);
    setResetCode('');
  };
  
  if (loading && !userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs - Only Security and Preferences */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-6 ${
              activeTab === 'security'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-6 ${
              activeTab === 'preferences'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preferences
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Change Password</h3>
                  
                  {!forgotPasswordMode ? (
                    <button 
                      onClick={switchToForgotMode}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Forgot Password?
                    </button>
                  ) : (
                    <button 
                      onClick={switchToNormalMode}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Back to Normal Change
                    </button>
                  )}
                </div>
                
                {!forgotPasswordMode ? (
                  // Normal password change form
                  <form onSubmit={handlePasswordChange} className="max-w-lg">
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        disabled={loading}
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Forgot password flow
                  <div className="max-w-lg">
                    {!resetSent ? (
                      // Step 1: Request reset code
                      <form onSubmit={handleRequestPasswordReset}>
                        <div className="mb-4">
                          <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="resetEmail"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          We'll send a password reset code to your email address.
                        </p>
                        
                        <button
                          type="submit"
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                      </form>
                    ) : (
                      // Step 2: Enter reset code and new password
                      <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                          <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Reset Code
                          </label>
                          <input
                            type="text"
                            id="resetCode"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="newPasswordReset" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPasswordReset"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-6">
                          <label htmlFor="confirmPasswordReset" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPasswordReset"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Account Sessions</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Current Session</p>
                      <p className="text-xs text-gray-500">Started: {sessionStartTime.toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOutAllDevices}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Signing Out...' : 'Sign Out from All Devices'}
                </button>
              </div>
            </div>
          )}
          
          {/* App Preferences */}
          {activeTab === 'preferences' && (
            <div>
              {/* Preferences content remains the same */}
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Preferences</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Theme</h3>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        preferences.theme === 'light'
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setPreferences({...preferences, theme: 'light'})}
                    >
                      <div className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm">
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-100 rounded mt-2"></div>
                        <div className="h-3 w-1/2 bg-gray-100 rounded mt-1"></div>
                      </div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        preferences.theme === 'dark'
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setPreferences({...preferences, theme: 'dark'})}
                    >
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-3 mb-3 shadow-sm">
                        <div className="h-4 w-1/2 bg-gray-600 rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-700 rounded mt-2"></div>
                        <div className="h-3 w-1/2 bg-gray-700 rounded mt-1"></div>
                      </div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Language</h3>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="hindi">Hindi</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Font Size</h3>
                  <div className="flex items-center space-x-6 max-w-md">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        checked={preferences.fontSize === 'small'}
                        onChange={() => setPreferences({...preferences, fontSize: 'small'})}
                      />
                      <span className="ml-2 text-sm">Small</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        checked={preferences.fontSize === 'medium'}
                        onChange={() => setPreferences({...preferences, fontSize: 'medium'})}
                      />
                      <span className="ml-2 text-base">Medium</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        checked={preferences.fontSize === 'large'}
                        onChange={() => setPreferences({...preferences, fontSize: 'large'})}
                      />
                      <span className="ml-2 text-lg">Large</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={savePreferences}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
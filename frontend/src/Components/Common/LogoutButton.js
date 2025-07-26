import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useAppContext } from '../../LocalStorage';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from "@mui/icons-material/Logout";

const LogoutButton = ({ className = "" }) => {
  const { user: googleUser, logout: googleLogout } = useAuth();
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (googleUser) {
        // Google logout - this will redirect to backend logout route
        console.log('🚪 Logging out Google user:', googleUser.email);
        await googleLogout();
      } else {
        // Local logout
        console.log('🚪 Logging out local user');
        setUser(undefined);
        navigate("/");
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback - clear everything and redirect
      setUser(undefined);
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex flex-row justify-center items-center bg-purple-300 border-t-4 border-b-4 border-purple-400 p-4 hover:bg-purple-400 transition-colors ${className}`}
    >
      <LogoutIcon />
      <h1 className="ml-2 font-rubik font-semibold">Log out</h1>
    </button>
  );
};

export default LogoutButton;

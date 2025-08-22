import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import this
import AppRoutes from './Router';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("Home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate(); // ✅ hook for navigation

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("storedUser");

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoggedIn(true);
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("storedUser");
    setUser(null);
    setLoggedIn(false);
    setShowLogoutModal(false);
    setCurrentPage("Home");
    navigate("/"); // ✅ forcibly navigate to home
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex flex-1">
      <div className="flex flex-col h-full w-full overflow-x-hidden">
        <div className="relative flex flex-col h-full w-full">
          <Header
            setterCurrentPage={setCurrentPage}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            // currentPage={currentPage}
            user={user || undefined}
            onLogout={handleLogout}
          />

          <AppRoutes
            currentPage={currentPage}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            setUser={setUser}
          />

          <Footer />

          {showLogoutModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-semibold mb-4">
                  Are you sure you want to log out?
                </h2>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                    onClick={cancelLogout}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    onClick={confirmLogout}
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

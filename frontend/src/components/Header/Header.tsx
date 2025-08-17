import HamburgerIcon from '../../assets/hamburgerIcon.svg';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

type HeaderProps = {
  setterCurrentPage: (value: string) => void;
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  user?: { username?: string; email?: string };
  onLogout: () => void; // <-- gets passed from App
};

export default function Header({
  setterCurrentPage,
  loggedIn,
  setLoggedIn,
  user,
  onLogout, // ✅ destructure it here
}: HeaderProps) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    let page = 'Home';
    if (path.includes('recipes')) page = 'Recipes';
    else if (path.includes('diets')) page = 'Diets';
    else if (path.includes('articles')) page = 'Articles';
    else if (path.includes('login')) page = 'Login';
    setterCurrentPage(page);
  }, [location.pathname, setterCurrentPage]);

  const isActive = (path: string) => location.pathname === path;

  const baseClass =
    "default-text font-normal text-lg cursor-pointer select-none relative";
  const activeClass =
    "selected-text px-2 rounded-sm underline font-normal";

  function openNav() {
    setNavOpen(!navOpen);
  }

  return (
    <header>
      <div className="p-4">
        {/* MOBILE NAV */}
        <div className="landscape:hidden h-full w-full flex justify-end">
          <button onClick={openNav}>
            <img src={HamburgerIcon} className="h-4" alt="Collapse" />
          </button>

          {/* Overlay */}
          <div
            onClick={openNav}
            className={`fixed top-0 left-0 h-dvh w-dvw bg-black transition-opacity duration-300 ease-in-out z-50 ${
              navOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Navbar */}
          <div
            className={`fixed top-0 left-0 w-full h-fit p-4 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-60 ${
              navOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <nav className="flex flex-col gap-2">
              <Link to="/" onClick={() => setterCurrentPage("Home")} className={`${baseClass} ${isActive("/") ? activeClass : ""}`}>
                Home
              </Link>
              <Link to="/recipes" onClick={() => setterCurrentPage("Recipes")} className={`${baseClass} ${isActive("/recipes") ? activeClass : ""}`}>
                Recipes
              </Link>
              <Link to="/diets" onClick={() => setterCurrentPage("Diets")} className={`${baseClass} ${isActive("/diets") ? activeClass : ""}`}>
                Diets
              </Link>
              <Link to="/articles" onClick={() => setterCurrentPage("Articles")} className={`${baseClass} ${isActive("/articles") ? activeClass : ""}`}>
                Articles
              </Link>

              {!loggedIn ? (
                <Link to="/login" onClick={() => setterCurrentPage("Login")} className={`${baseClass} ${isActive("/login") ? activeClass : ""}`}>
                  Login
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`${baseClass}`}
                  >
                    {user?.username || "Profile"}
                  </button>

                  {/* Profile dropdown */}
                  <div
                    className={`absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-xl transform transition-all duration-300 ease-in-out z-70 ${
                      profileOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <ul className="flex flex-col p-2 gap-2">
                      <Link to="/my-articles" className="hover:bg-gray-100 p-2 rounded-md">
                        My Articles
                      </Link>
                      <Link to="/my-recipes" className="hover:bg-gray-100 p-2 rounded-md">
                        My Recipes
                      </Link>
                      <Link to="/favorites/articles" className="hover:bg-gray-100 p-2 rounded-md">
                        Favorite Articles
                      </Link>
                      <Link to="/favorites/recipes" className="hover:bg-gray-100 p-2 rounded-md">
                        Favorite Recipes
                      </Link>
                      <button
                        onClick={onLogout} // ✅ use prop instead of local handleLogout
                        className="text-red-500 hover:bg-red-50 p-2 rounded-md text-left"
                      >
                        Logout
                      </button>
                    </ul>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div className="portrait:hidden flex justify-end px-6">
          <nav className="flex gap-8 items-center">
            <Link to="/" onClick={() => setterCurrentPage("Home")} className={`${baseClass} ${isActive("/") ? activeClass : ""}`}>
              Home
            </Link>
            <Link to="/recipes" onClick={() => setterCurrentPage("Recipes")} className={`${baseClass} ${isActive("/recipes") ? activeClass : ""}`}>
              Recipes
            </Link>
            <Link to="/diets" onClick={() => setterCurrentPage("Diets")} className={`${baseClass} ${isActive("/diets") ? activeClass : ""}`}>
              Diets
            </Link>
            <Link to="/articles" onClick={() => setterCurrentPage("Articles")} className={`${baseClass} ${isActive("/articles") ? activeClass : ""}`}>
              Articles
            </Link>

            {!loggedIn ? (
              <Link to="/login" onClick={() => setterCurrentPage("Login")} className={`${baseClass} ${isActive("/login") ? activeClass : ""}`}>
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`${baseClass}`}
                >
                  {user?.username || "Profile"}
                </button>

                {/* Profile dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-xl transform transition-all duration-300 ease-in-out ${
                    profileOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <ul className="flex flex-col p-2 gap-2">
                    <Link to="/my-articles" className="hover:bg-gray-100 p-2 rounded-md">
                      My Articles
                    </Link>
                    <Link to="/my-recipes" className="hover:bg-gray-100 p-2 rounded-md">
                      My Recipes
                    </Link>
                    <Link to="/favorites/articles" className="hover:bg-gray-100 p-2 rounded-md">
                      Favorite Articles
                    </Link>
                    <Link to="/favorites/recipes" className="hover:bg-gray-100 p-2 rounded-md">
                      Favorite Recipes
                    </Link>
                    <button
                      onClick={onLogout} // ✅ triggers App modal
                      className="text-red-500 hover:bg-red-50 p-2 rounded-md text-left"
                    >
                      Logout
                    </button>
                  </ul>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
      <hr className="w-[96%] mx-auto" />
    </header>
  );
}

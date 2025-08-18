import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HamburgerIcon from '../../assets/hamburgerIcon.svg';

type HeaderProps = {
  setterCurrentPage: (value: string) => void;
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  user?: { username?: string; email?: string };
  onLogout: () => void;
};

export default function Header({
  setterCurrentPage,
  loggedIn,
  user,
  onLogout,
}: HeaderProps) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfileOption, setSelectedProfileOption] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = location.pathname;
    let page = 'Home';
    if (path.includes('recipes')) page = 'Recipes';
    else if (path.includes('diets')) page = 'Diets';
    else if (path.includes('articles')) page = 'Articles';
    else if (path.includes('login')) page = 'Login';
    setterCurrentPage(page);
  }, [location.pathname, setterCurrentPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const baseClass = "default-text font-normal text-lg cursor-pointer select-none relative";
  const activeClass = "selected-text px-2 rounded-sm underline font-normal";

  // Dropdown option styling
  const optionBase = "p-2 rounded-md transition-all duration-200 delay-200";
  const optionActive = "bg-[#2a372d] text-white transition-all duration-200 delay-200"; // ✅ updated highlight style

  // const navigate = useNavigate();

  const profileOptions = [
    { label: "My Articles", path: "/user/my-articles" },
    { label: "My Recipes", path: "/user/my-recipes" },
    { label: "Favorite Articles", path: "/user/articles" },
    { label: "Favorite Recipes", path: "/user/recipes" },
  ];

  return (
    <header>
      <div className="p-4">
        {/* MOBILE NAV */}
        <div className="landscape:hidden h-full w-full flex justify-end">
          <button onClick={() => setNavOpen(!navOpen)}>
            <img src={HamburgerIcon} className="h-4" alt="Collapse" />
          </button>

          <div
            onClick={() => setNavOpen(false)}
            className={`fixed top-0 left-0 h-dvh w-dvw bg-black transition-opacity duration-300 ease-in-out z-50 ${
              navOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          <div
            className={`fixed top-0 left-0 w-full h-fit p-4 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-60 ${
              navOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <nav className="flex flex-col gap-2">
              <Link to="/" onClick={() => setNavOpen(false)} className={`${baseClass} ${isActive("/") ? activeClass : ""}`}>
                Home
              </Link>
              <Link to="/recipes" onClick={() => setNavOpen(false)} className={`${baseClass} ${isActive("/recipes") ? activeClass : ""}`}>
                Recipes
              </Link>
              <Link to="/diets" onClick={() => setNavOpen(false)} className={`${baseClass} ${isActive("/diets") ? activeClass : ""}`}>
                Diets
              </Link>
              <Link to="/articles" onClick={() => setNavOpen(false)} className={`${baseClass} ${isActive("/articles") ? activeClass : ""}`}>
                Articles
              </Link>

              {!loggedIn ? (
                <Link to="/login" onClick={() => setNavOpen(false)} className={`${baseClass} ${isActive("/login") ? activeClass : ""}`}>
                  Login
                </Link>
              ) : (
                <div className="relative" ref={profileRef}>
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
                      {profileOptions.map((opt) => (
                        <Link
                          key={opt.path}
                          to={opt.path}
                          onClick={() => {
                            // setProfileOpen(false);
                            setSelectedProfileOption(opt.path);
                          }}
                          className={`${optionBase} ${
                            location.pathname === opt.path ? optionActive : ""
                          }`}
                        >
                          {opt.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
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
            <Link to="/" className={`${baseClass} ${isActive("/") ? activeClass : ""}`}>Home</Link>
            <Link to="/recipes" className={`${baseClass} ${isActive("/recipes") ? activeClass : ""}`}>Recipes</Link>
            <Link to="/diets" className={`${baseClass} ${isActive("/diets") ? activeClass : ""}`}>Diets</Link>
            <Link to="/articles" className={`${baseClass} ${isActive("/articles") ? activeClass : ""}`}>Articles</Link>

            {!loggedIn ? (
              <Link to="/login" className={`${baseClass} ${isActive("/login") ? activeClass : ""}`}>Login</Link>
            ) : (
              <div className="relative" ref={profileRef}>
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
                    {profileOptions.map((opt) => (
                      <Link
                        key={opt.path}
                        to={opt.path}
                        onClick={() => {
                          // setProfileOpen(false);
                          setSelectedProfileOption(opt.path);
                        }}
                        className={`${optionBase} ${
                          location.pathname === opt.path ? optionActive : ""
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
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

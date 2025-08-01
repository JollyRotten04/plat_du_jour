import HamburgerIcon from '../../assets/hamburgerIcon.svg';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

type HeaderProps = {
  setterCurrentPage: (value: string) => void;
};

export default function Header({ setterCurrentPage }: HeaderProps) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let page = 'Home';
    if (path.includes('recipes')) page = 'Recipes';
    else if (path.includes('diets')) page = 'Diets';
    else if (path.includes('articles')) page = 'Articles';
    else if (path.includes('login')) page = 'Login';

    setterCurrentPage(page);
  }, [location.pathname, setterCurrentPage]);

  // Helper function to check if current link is active
  const isActive = (path: string) => location.pathname === path;

  const baseClass = "default-text font-normal text-lg cursor-pointer select-none";
  const activeClass = "selected-text px-2 rounded-sm underline font-normal"; // You can customize this
  const [navOpen, setNavOpen] = useState(false);

  function openNav(){
    if(!navOpen)
      setNavOpen(true);

    else
      setNavOpen(false);
  }

  return (
    <header>
      <div className="p-4">
        <div className="landscape:hidden h-full w-full flex justify-end">

          {/* Collapsible Navbar for Mobile Hamburger Icon */}
          <button onClick={openNav}><img src={HamburgerIcon} className="h-4" alt="Collapse" /></button>

          {/* Overlay */}
          <div
            onClick={openNav}
            className={`fixed top-0 left-0 h-dvh w-dvw bg-black transition-opacity duration-300 ease-in-out z-50 ${
              navOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Navbar */}
          <div
            className={`fixed top-0 left-0 w-full h-fit p-4 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-60 ${
              navOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            
            {/* Nav Values */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setterCurrentPage('Home')}
                className={`${baseClass} ${isActive('/') ? activeClass : ''}`}
              >
                Home
              </Link>
              <Link
                to="/recipes"
                onClick={() => setterCurrentPage('Recipes')}
                className={`${baseClass} ${isActive('/recipes') ? activeClass : ''}`}
              >
                Recipes
              </Link>
              <Link
                to="/diets"
                onClick={() => setterCurrentPage('Diets')}
                className={`${baseClass} ${isActive('/diets') ? activeClass : ''}`}
              >
                Diets
              </Link>
              <Link
                to="/articles"
                onClick={() => setterCurrentPage('Articles')}
                className={`${baseClass} ${isActive('/articles') ? activeClass : ''}`}
              >
                Articles
              </Link>
              <Link
                to="/login"
                onClick={() => setterCurrentPage('Login')}
                className={`${baseClass} ${isActive('/login') ? activeClass : ''}`}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>

        <div className="portrait:hidden flex justify-end px-6">
          <nav className="flex gap-8">
            <Link
              to="/"
              onClick={() => setterCurrentPage('Home')}
              className={`${baseClass} ${isActive('/') ? activeClass : ''}`}
            >
              Home
            </Link>
            <Link
              to="/recipes"
              onClick={() => setterCurrentPage('Recipes')}
              className={`${baseClass} ${isActive('/recipes') ? activeClass : ''}`}
            >
              Recipes
            </Link>
            <Link
              to="/diets"
              onClick={() => setterCurrentPage('Diets')}
              className={`${baseClass} ${isActive('/diets') ? activeClass : ''}`}
            >
              Diets
            </Link>
            <Link
              to="/articles"
              onClick={() => setterCurrentPage('Articles')}
              className={`${baseClass} ${isActive('/articles') ? activeClass : ''}`}
            >
              Articles
            </Link>
            <Link
              to="/login"
              onClick={() => setterCurrentPage('Login')}
              className={`${baseClass} ${isActive('/login') ? activeClass : ''}`}
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
      <hr className="w-[96%] mx-auto" />
    </header>
  );
}

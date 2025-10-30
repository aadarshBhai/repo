import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const ut = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      setLoggedIn(Boolean(ut));
    };
    // Initialize on mount and on route changes (e.g., after login redirect)
    syncAuth();
    // Listen for auth changes across tabs/windows
    const handler = (e: StorageEvent) => {
      if (e.key === 'userToken') {
        syncAuth();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handler);
      }
    };
  }, [location.pathname]);

  

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "About Us", path: "/about-us" },
    { name: "Upload", path: "/upload" },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
    }
    setLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-heading font-bold text-primary-foreground">
              Heritage Repository
            </h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            {loggedIn && (
              <Link
                to="/profile"
                className={cn(
                  "nav-link text-sm font-medium transition-colors",
                  location.pathname === '/profile'
                    ? "text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
              >
                Profile
              </Link>
            )}
            {!loggedIn ? (
              <Link
                to="/signup"
                className={cn(
                  "nav-link text-sm font-medium transition-colors",
                  location.pathname === '/signup'
                    ? "text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
              >
                Sign Up
              </Link>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-xs font-medium px-2 py-1",
                    location.pathname === item.path
                      ? "text-primary-foreground"
                      : "text-primary-foreground/80"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {loggedIn && (
                <Link
                  to="/profile"
                  className={cn(
                    "text-xs font-medium px-2 py-1",
                    location.pathname === '/profile'
                      ? "text-primary-foreground"
                      : "text-primary-foreground/80"
                  )}
                >
                  Profile
                </Link>
              )}
              {!loggedIn ? (
                <Link
                  to="/signup"
                  className={cn(
                    "text-xs font-medium px-2 py-1",
                    location.pathname === '/signup'
                      ? "text-primary-foreground"
                      : "text-primary-foreground/80"
                  )}
                >
                  Sign Up
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

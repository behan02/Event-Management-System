import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../store/useAuthStore';

const linkBase = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
const linkInactive = "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50";
const linkActive = "text-white bg-indigo-600";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "E";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-8 flex-1 min-w-0">
            <Link to="/" className="text-2xl font-semibold text-indigo-600 whitespace-nowrap">
              Eventix
            </Link>
            <div className="hidden md:flex gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                Events
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                Profile
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
                >
                  Signup
                </NavLink>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">
                      {user?.name || "Eventix member"}
                    </p>
                    <p className="text-xs text-slate-500 truncate max-w-[160px]">
                      {user?.email || "Logged in"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
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
      <div className="px-20">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-8 flex-1 min-w-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600 whitespace-nowrap">
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
                to="/bookings"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                Bookings
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
                {/* <div className="flex items-center gap-3">
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
                </div> */}
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
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
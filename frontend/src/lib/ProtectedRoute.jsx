import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initializing } = useContext(AuthContext);
    const location = useLocation();

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Checking session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
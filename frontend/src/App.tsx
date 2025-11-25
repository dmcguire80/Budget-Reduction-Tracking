/**
 * App Component
 *
 * Main application component with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import AppLayout from '@components/layout/AppLayout';
import Dashboard from '@pages/Dashboard';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Accounts from '@pages/Accounts';
import AccountDetail from '@pages/AccountDetail';
import NotFound from '@pages/NotFound';
import { ROUTES } from '@config/constants';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />

          {/* Protected routes (with layout) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.HOME} element={<Dashboard />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path={ROUTES.TRANSACTIONS} element={<Accounts />} /> {/* Placeholder - will be implemented by Agent 9 */}
            <Route path={ROUTES.ANALYTICS} element={<Dashboard />} /> {/* Placeholder - will be implemented by Agent 11 */}
            <Route path={ROUTES.PROFILE} element={<Dashboard />} /> {/* Placeholder */}
            <Route path={ROUTES.SETTINGS} element={<Dashboard />} /> {/* Placeholder */}
          </Route>

          {/* 404 Not Found */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

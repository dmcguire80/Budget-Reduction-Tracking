/**
 * App Component
 *
 * Main application component with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@components/layout/AppLayout';
import Dashboard from '@pages/Dashboard';
import Login from '@pages/Login';
import Accounts from '@pages/Accounts';
import NotFound from '@pages/NotFound';
import { ROUTES } from '@config/constants';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no layout) */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Login />} /> {/* Placeholder - will be implemented by Agent 7 */}

        {/* Protected routes (with layout) */}
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<Dashboard />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
          <Route path="/accounts/:id" element={<Accounts />} /> {/* Placeholder - will be implemented by Agent 8 */}
          <Route path={ROUTES.TRANSACTIONS} element={<Accounts />} /> {/* Placeholder - will be implemented by Agent 9 */}
          <Route path={ROUTES.ANALYTICS} element={<Dashboard />} /> {/* Placeholder - will be implemented by Agent 11 */}
          <Route path={ROUTES.PROFILE} element={<Dashboard />} /> {/* Placeholder */}
          <Route path={ROUTES.SETTINGS} element={<Dashboard />} /> {/* Placeholder */}
        </Route>

        {/* 404 Not Found */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

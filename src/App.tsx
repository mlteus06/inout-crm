import './App.css'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'
import AuthProvider from './context/AuthContext'
import ApiDocs from './pages/ApiDocs'
import Auth from './pages/Auth'
import Billing from './pages/Billing'
import Dashboard from './pages/Dashboard'
import Integrations from './pages/Integrations'
import Kanban from './pages/Kanban'
import LeadDetail from './pages/LeadDetail'
import Leads from './pages/Leads'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Team from './pages/Team'
import NotFound from './pages/NotFound'

function App() {
  const router = createBrowserRouter([
    { path: '/auth', element: <Auth /> },
    {
      path: '/',
      element: (
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'leads', element: <Leads /> },
        { path: 'leads/:id', element: <LeadDetail /> },
        { path: 'kanban', element: <Kanban /> },
        { path: 'integrations', element: <Integrations /> },
        { path: 'api', element: <ApiDocs /> },
        { path: 'settings', element: <Settings /> },
        { path: 'team', element: <Team /> },
        { path: 'billing', element: <Billing /> },
        { path: 'reports', element: <Reports /> },
      ],
    },
    { path: '*', element: <NotFound /> },
  ])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App

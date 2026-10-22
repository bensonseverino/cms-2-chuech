import { createBrowserRouter, RouterProvider } from 'react-router'
import AdminShell from './components/AdminShell'
import Dashboard from './screens/Dashboard'
import NotFound from './screens/NotFound'
import Placeholder from './screens/Placeholder'

/*
 * Admin routes (spec §5.3). Every screen is registered now so navigation and
 * breadcrumbs are stable; the bodies land in Phase 9. Pages/collections keep
 * their detail routes (`/pages/:slug`, `/collections/:name/:id`) so links from
 * the inbox and dashboards have somewhere to go.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'submissions',
        element: (
          <Placeholder
            title="Form inbox"
            phase="Phase 9"
            description="Filter by status, form and date; bulk actions; CSV export to match the filters; unread rows bold with a mint dot."
          />
        ),
      },
      {
        path: 'submissions/:id',
        element: (
          <Placeholder
            title="Submission detail"
            phase="Phase 9"
            description="The right drawer: every stored field, page path, referrer, UTM, status control, internal notes and previous/next."
          />
        ),
      },
      {
        path: 'pages',
        element: (
          <Placeholder
            title="Pages"
            phase="Phase 9"
            description="Every document — site settings, navigation, footer, Home, Services, Work and each service or generic page — with status chips and a Changed indicator."
          />
        ),
      },
      {
        path: 'pages/:slug',
        element: (
          <Placeholder
            title="Document editor"
            phase="Phase 9"
            description="Schema-driven groups rendered from the FieldDef catalog, with Save draft, Publish, Revert and Unpublish."
          />
        ),
      },
      {
        path: 'collections/:name',
        element: (
          <Placeholder
            title="Collection"
            phase="Phase 9"
            description="Projects, services, testimonials, clients and articles as a sortable table with thumbnails and status."
          />
        ),
      },
      {
        path: 'collections/:name/:id',
        element: (
          <Placeholder
            title="Entry editor"
            phase="Phase 9"
            description="The same schema-driven editor as documents, for one collection entry."
          />
        ),
      },
      {
        path: 'media',
        element: (
          <Placeholder
            title="Media library"
            phase="Phase 9"
            description="Grid and list, drag-and-drop upload with progress, focus-point picker, video posters and the admin-only import of existing bucket objects."
          />
        ),
      },
      {
        path: 'forms',
        element: (
          <Placeholder
            title="Forms"
            phase="Phase 9"
            description="Per source: label, enabled, notification emails, success message and submission counts."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <Placeholder
            title="Site settings"
            phase="Phase 9"
            description="Company details, the navigation tree editor, the footer block and SEO defaults."
          />
        ),
      },
      {
        path: 'users',
        element: (
          <Placeholder
            title="Users"
            phase="Phase 9"
            description="Admin only: invite by email, set a role, deactivate. Roles are enforced server-side."
          />
        ),
      },
      {
        path: 'audit',
        element: (
          <Placeholder
            title="Activity log"
            phase="Phase 9"
            description="Admin only: who changed what, when, with a link to the record."
          />
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

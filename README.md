# HealthBuddy Web

Provider-facing React application for managing patient access, clinical timelines, and document workflows. Built with Vite, Tailwind CSS, Redux Toolkit, and Supabase.

## Features

- **Provider authentication** backed by Supabase; only users present in the `providers` table can access the dashboard.
- **Fine-grained patient access control** with audit logging for pending, allowed, denied, or revoked statuses.
- **Searchable patient roster** supporting name, ID, phone, and email lookups with helpful loading and error states.
- **Interactive medical timeline** that groups events by month, filters by type, and eagerly pulls associated documents.
- **Document viewer** with zoom, pan, and multi-document navigation for images stored in Supabase buckets.
- **Provider profile management** including specialty, license details, contact info, and password updates.
- **Reusable UI utilities** such as toast notifications and gated modals for access requests.

## Tech Stack

- React 19 with React Router 7
- Vite 7 + @vitejs/plugin-react + Tailwind CSS (via `@tailwindcss/vite`)
- Redux Toolkit & React Redux for global state
- Supabase (Auth, Postgres, Storage)
- Lucide icons for UI glyphs
- ESLint 9 for linting

## Getting Started

### Prerequisites

- Node.js 18.0+ (Vite 7 requires Node 18 or newer)
- npm 9+ (or your preferred compatible package manager)

### Installation

```bash
git clone https://github.com/Alok-Godara/HealthBuddy-Web.git
cd HealthBuddy-Web/Web
npm install
```

### Environment Variables

Create a `.env.local` file in the project root (same folder as `package.json`) and supply your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_API=public-anon-or-service-role-key
```

Both values are required; the app will throw on start if either is missing. Use a service role key only in server-side contexts.

### Development

```bash
# Start Vite dev server with hot reloading
npm run dev

# Run eslint across the project
npm run lint

# Create an optimized production build
npm run build

# Preview the built app locally
npm run preview
```

By default Vite serves on `http://localhost:5173` and is configured to accept external connections.

## Project Structure

```
Web/
├─ src/
│  ├─ App.jsx                # Auth gate & router outlet
│  ├─ main.jsx               # Router + Redux bootstrap
│  ├─ index.css              # Tailwind entrypoint
│  ├─ components/
│  │  ├─ Dashboard.jsx       # Shell with patient list
│  │  ├─ Navigation.jsx      # Top nav + logout handling
│  │  ├─ PatientList.jsx     # Search + access request flow
│  │  ├─ PatientPortal.jsx   # Timeline + document view layout
│  │  ├─ Timeline.jsx        # Medical history timeline
│  │  ├─ PatientDocs.jsx     # Summary & document viewer
│  │  ├─ ProviderProfile.jsx # Provider settings form
│  │  └─ ...
│  ├─ pages/                 # Landing, login, and signup screens
│  ├─ store/                 # Redux slices and store config
│  └─ supabase/              # Supabase client and data services
├─ vite.config.js
├─ eslint.config.js
└─ package.json
```

## Supabase Data Model

The UI expects the following tables and relationships (column names inferred from Supabase queries):

- `providers`: `id (uuid)`, `name`, `email`, `phone`, `specialty`, `license_number`, `password`, timestamps.
- `patients`: `id`, `name`, `email`, `phone`, `date_of_birth`, JSON columns such as `allergies`, `medications`, `medical_history`, `vitals`.
- `medical_events`: `id`, `patient_id`, `type`, `title`, `description`, `event_date`, `provider_name`.
- `documents`: `id`, `medical_event_id`, `file_url`, `file_size`, `is_processed`; files reside in the `medical_data` public storage bucket.
- `provider_patient_access`: `provider_id`, `patient_id`, `status` (`allowed`, `pending`, `denied`, `revoked`), `granted_at`, timestamps.

Access events are logged client-side via `logAccessRequest`; connect this method to a Supabase table (e.g., `access_audit_log`) if server-side auditing is required.

## Architecture Notes

- **Routing**: `main.jsx` defines routes for landing, auth, and the `/dashboard` shell (which renders nested routes through `App.jsx`).
- **Auth state**: The initial effect in `App.jsx` verifies the Supabase session, fetches the provider record, and hydrates Redux + `localStorage`. Users not present in `providers` are signed out.
- **State management**: `authSlice` stores the authenticated user and provider details; components read via `useSelector`.
- **Data services**: `src/supabase/dataConfig.js` centralizes Supabase queries, transformations, and helper utilities such as signed storage URLs and age calculation.
- **Access control**: `PatientList` consults `provider_patient_access` before navigating to the portal, presenting modals for denied or pending states and allowing requests/resubmissions.
- **Styling**: Tailwind CSS handles layout and theming. Additional gradient and SVG patterns are embedded inline in components.

## Document Viewer

`PatientDocs` fetches event documents on demand, builds full Supabase storage URLs, and offers:

- Zoom in/out with smooth scaling and auto-centering when returning to 1x.
- Click-and-drag panning when zoomed past 1x.
- Navigation controls when multiple documents are associated with an event.

## Troubleshooting

- Missing Supabase env vars will throw during startup; verify `.env.local` is loaded (restart Vite after changes).
- Ensure the authenticated provider exists in the `providers` table or login will immediately sign the user out.
- If documents are not rendering, confirm the file paths stored in `documents.file_url` match the public bucket structure expected by `DataServices.getStorageUrl`.

## Next Steps

- Integrate the access log helper with a real Supabase table for persistent auditing.
- Expand form validation/tests and add unit coverage for data services.
- Configure deployment (e.g., Vite build + Supabase hosted storage) once environment variables are provisioned for production.

# ZK.AI Client Portal

## Production Deployment
A modern client portal for managing AI workflows, analytics, and automation with ZK.AI's powerful platform.
### Supabase Configuration
After deploying to production, you need to configure your Supabase credentials:
1. **Edit the config file**: Open `/config.js` in your deployed application and replace the placeholder values:
   ```javascript
   window.__APP_CONFIG__ = {
     SUPABASE_URL: 'https://your-actual-project.supabase.co',
     SUPABASE_ANON_KEY: 'your-actual-anon-key-here',
     // ... other config
   };
   ```
2. **Alternative: Environment Variables**: If your hosting platform supports runtime environment variables, you can set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
### Deployment Checklist
- [ ] Update `public/config.js` with your Supabase credentials
- [ ] Ensure all static files are properly served
- [ ] Test authentication flow in production
- [ ] Verify database connections work
- [ ] Check that all routes are properly handled (SPA routing)
## Development
### Local Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start development server: `npm run dev`
### Building for Production
```bash
npm run build
```
The build output will be in the `dist/` folder, ready for deployment.
## Features
- **Client Portal**: Secure client dashboard with workflow management
- **Admin Panel**: Administrative interface for managing clients and workflows
- **Analytics**: Real-time performance tracking and reporting
- **Workflow Management**: Create, monitor, and manage automated workflows
- **Authentication**: Secure login with Supabase Auth
- **Responsive Design**: Works on desktop and mobile devices
## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: Lucide React
- **Deployment**: Static hosting (Netlify, Vercel, etc.)
# AI Development Rules for ZK.AI Client Portal

This document outlines the core technologies used in the ZK.AI Client Portal and provides clear guidelines for library usage to maintain consistency, performance, and maintainability.

## Tech Stack Overview

*   **Frontend Framework**: React 18 with TypeScript for building dynamic user interfaces.
*   **Styling**: Tailwind CSS for utility-first, responsive design.
*   **Backend & Database**: Supabase, providing PostgreSQL database, authentication, and real-time capabilities.
*   **Build Tool**: Vite for a fast development experience and optimized production builds.
*   **Routing**: React Router for client-side navigation.
*   **Icons**: Lucide React for a consistent and scalable icon set.
*   **UI Components**: shadcn/ui for accessible and customizable UI components.
*   **Charting**: Chart.js for data visualization within analytics dashboards.

## Library Usage Rules

To ensure a cohesive and efficient development process, please adhere to the following rules when using libraries:

*   **React & TypeScript**: All new components and application logic must be written using React and TypeScript (`.tsx` files).
*   **Tailwind CSS**: All styling should be implemented using Tailwind CSS classes. Avoid custom CSS files or inline styles unless absolutely necessary for dynamic, computed styles.
*   **Supabase**: Use the `@supabase/supabase-js` library for all interactions with the Supabase backend, including authentication, database queries, and real-time subscriptions.
*   **React Router**: Manage all client-side navigation using `react-router-dom`. Keep the main routing configuration within `src/App.tsx`.
*   **Lucide React**: For any icons required in the UI, use components from the `lucide-react` library.
*   **shadcn/ui**: Leverage existing shadcn/ui components for common UI patterns (e.g., buttons, forms, cards). If a component requires significant customization, create a new component that wraps or extends the shadcn/ui component, rather than modifying the original library files.
*   **Chart.js**: For any data visualization or charting needs, use the `chart.js` library.
*   **Vite**: The project uses Vite for development and building. Do not introduce other build tools or bundlers.
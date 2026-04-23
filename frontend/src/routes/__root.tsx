import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center animate-in fade-in zoom-in duration-500">
        <h1 className="text-9xl font-black text-primary/20">404</h1>
        <h2 className="mt-4 text-3xl font-black text-foreground">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:opacity-90 shadow-[var(--shadow-soft)] hover:scale-105 active:scale-95"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FlowFix — Premium On-Demand Services" },
      { name: "description", content: "Get verified professionals for plumbing, electrical, cleaning, and more. 15-minute response time." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Simple dark mode detection for SSR/initial load to prevent flash
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      <InnerRoot />
    </AppProvider>
  );
}

function InnerRoot() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-[4px] border-primary/20" />
          <div className="absolute h-full w-full animate-spin rounded-full border-[4px] border-primary border-t-transparent shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
          <span className="font-bold text-primary animate-pulse">FF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <div className="animate-in fade-in duration-700 fill-mode-both">
        <Outlet />
      </div>
      <Toaster position="top-right" richColors theme="system" />
    </div>
  );
}

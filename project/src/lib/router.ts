import { useState, useEffect, useCallback } from 'react';
import type { Role } from '@/types';

/**
 * Normalizes browser path from either pathname or hash
 */
export function getNormalizedPath(): string {
  // Check hash first (e.g. #/login/student)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    return hash.slice(1).split('?')[0];
  }
  // Otherwise use pathname
  const path = window.location.pathname;
  if (!path || path === '' || path === '/index.html') {
    return '/';
  }
  return path.split('?')[0];
}

/**
 * Maps a user's role to their designated dashboard route
 */
export function getDashboardRouteForRole(role: Role): string {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'hod':
      return '/hod/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

/**
 * Maps a role to its specific login route
 */
export function getLoginRouteForRole(role: Role): string {
  return `/login/${role}`;
}

export type RouteType =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'signup-restricted'
  | 'forgot-password'
  | 'dashboard'
  | 'not-found';

export interface ParsedRoute {
  rawPath: string;
  type: RouteType;
  targetRole?: Role;
}

/**
 * Parses any path into structured route metadata
 */
export function parseRoute(path: string): ParsedRoute {
  const clean = path.replace(/\/+$/, '') || '/';

  if (clean === '/') {
    return { rawPath: clean, type: 'welcome' };
  }

  if (clean.startsWith('/login/')) {
    const role = clean.replace('/login/', '') as Role;
    if (['student', 'teacher', 'hod', 'admin'].includes(role)) {
      return { rawPath: clean, type: 'login', targetRole: role };
    }
  }

  if (clean === '/signup/student') {
    return { rawPath: clean, type: 'signup', targetRole: 'student' };
  }

  if (clean === '/signup/teacher') {
    return { rawPath: clean, type: 'signup', targetRole: 'teacher' };
  }

  if (clean === '/signup/hod') {
    return { rawPath: clean, type: 'signup-restricted', targetRole: 'hod' };
  }

  if (clean === '/signup/admin') {
    return { rawPath: clean, type: 'signup-restricted', targetRole: 'admin' };
  }

  if (clean === '/forgot-password') {
    return { rawPath: clean, type: 'forgot-password' };
  }

  if (clean === '/student/dashboard') {
    return { rawPath: clean, type: 'dashboard', targetRole: 'student' };
  }

  if (clean === '/teacher/dashboard') {
    return { rawPath: clean, type: 'dashboard', targetRole: 'teacher' };
  }

  if (clean === '/hod/dashboard') {
    return { rawPath: clean, type: 'dashboard', targetRole: 'hod' };
  }

  if (clean === '/admin/dashboard') {
    return { rawPath: clean, type: 'dashboard', targetRole: 'admin' };
  }

  return { rawPath: clean, type: 'not-found' };
}

/**
 * Hook to manage routing, pushState navigation, and URL updates
 */
export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => getNormalizedPath());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    const cleanTo = to.startsWith('/') ? to : `/${to}`;
    if (replace) {
      window.history.replaceState({}, '', cleanTo);
    } else {
      window.history.pushState({}, '', cleanTo);
    }
    setCurrentPath(cleanTo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const parsed = parseRoute(currentPath);

  return {
    currentPath,
    parsedRoute: parsed,
    navigate,
  };
}

"use client";

import { createContext, useContext } from "react";

/**
 * Server-provided auth flags.
 *
 * Client components cannot read server-only environment variables, so the root
 * layout passes what they need down through context instead of duplicating the
 * value in a NEXT_PUBLIC_ variable that could drift out of sync.
 *
 * Defaults to false, which is the safe direction: the admin password field stays
 * hidden unless the server confirms an admin password is actually configured.
 */
const AuthFlagsContext = createContext<{ adminPasswordEnabled: boolean }>({
  adminPasswordEnabled: false,
});

export function AuthFlagsProvider({
  adminPasswordEnabled,
  children,
}: {
  adminPasswordEnabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthFlagsContext.Provider value={{ adminPasswordEnabled }}>
      {children}
    </AuthFlagsContext.Provider>
  );
}

/** True when ADMIN_PASSWORD is set on the server, i.e. password sign-in works. */
export function useAdminPasswordEnabled(): boolean {
  return useContext(AuthFlagsContext).adminPasswordEnabled;
}

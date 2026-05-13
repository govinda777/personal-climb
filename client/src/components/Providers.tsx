'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#ffffff',
          logo: 'https://github.com/govinda777.png', // Placeholder or brand logo
        },
        loginMethods: ['email'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

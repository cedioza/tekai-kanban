import { ReactNode } from 'react';
import { ActivityProvider } from './ActivityContext';
import { TareaProvider } from './TareaContext';
import { ResponsableProvider } from './ResponsableContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ActivityProvider>
      <ResponsableProvider>
        <TareaProvider>
          {children}
        </TareaProvider>
      </ResponsableProvider>
    </ActivityProvider>
  );
}
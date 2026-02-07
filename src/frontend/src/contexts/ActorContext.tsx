import React, { createContext, ReactNode } from 'react';
import { useActor } from '../hooks/useActor';
import type { backendInterface } from '../backend';

interface ActorContextValue {
  actor: backendInterface | null;
  actorFetching: boolean;
}

export const ActorContext = createContext<ActorContextValue | undefined>(undefined);

interface ActorProviderProps {
  children: ReactNode;
}

export function ActorProvider({ children }: ActorProviderProps) {
  const { actor, isFetching } = useActor();

  return (
    <ActorContext.Provider value={{ actor, actorFetching: isFetching }}>
      {children}
    </ActorContext.Provider>
  );
}

import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import type { backendInterface } from '../backend';

interface ActorContextValue {
  actor: backendInterface | null;
  actorFetching: boolean;
  actorError: Error | null;
  refetchActor: () => void;
}

export const ActorContext = createContext<ActorContextValue | undefined>(undefined);

interface ActorProviderProps {
  children: ReactNode;
}

export function ActorProvider({ children }: ActorProviderProps) {
  const { actor, isFetching } = useActor();
  const [actorError, setActorError] = useState<Error | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Monitor actor initialization with timeout
  useEffect(() => {
    if (isFetching && !actor) {
      // Set a timeout for actor initialization
      const id = setTimeout(() => {
        if (!actor && isFetching) {
          setActorError(new Error('Actor initialization timed out after 30 seconds. Please check your network connection and try again.'));
        }
      }, 30000);
      setTimeoutId(id);
    } else if (actor) {
      // Clear timeout and error when actor is ready
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setActorError(null);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [actor, isFetching]);

  const refetchActor = () => {
    // Clear error and reload the page to reinitialize actor
    setActorError(null);
    window.location.reload();
  };

  return (
    <ActorContext.Provider value={{ 
      actor, 
      actorFetching: isFetching,
      actorError,
      refetchActor
    }}>
      {children}
    </ActorContext.Provider>
  );
}

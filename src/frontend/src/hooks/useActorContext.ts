import { useContext } from 'react';
import { ActorContext } from '../contexts/ActorContext';

export function useActorContext() {
  const context = useContext(ActorContext);
  if (context === undefined) {
    throw new Error('useActorContext must be used within an ActorProvider');
  }
  return context;
}

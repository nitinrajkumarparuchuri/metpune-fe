import React, { createContext, useState, useContext, useEffect } from 'react';
import { useHackathons } from '@/hooks/use-data';
import type { Hackathon } from '@/lib/api';

interface HackathonContextType {
  selectedHackathonId: number | undefined;
  setSelectedHackathonId: (id: number) => void;
  selectedHackathon: Hackathon | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default undefined value
const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | undefined>(undefined);
  const { data: hackathons, isLoading, error } = useHackathons();
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | undefined>(undefined);

  // When hackathons are loaded, set the default selected hackathon
  useEffect(() => {
    if (hackathons && hackathons.length > 0 && !selectedHackathonId) {
      // Try to find an active hackathon
      const activeHackathon = hackathons.find(h => h.status === 'active');
      if (activeHackathon) {
        setSelectedHackathonId(activeHackathon.id);
      } else {
        // If no active hackathon, select the first one
        setSelectedHackathonId(hackathons[0].id);
      }
    }
  }, [hackathons, selectedHackathonId]);

  // When selected hackathon ID changes, update the selected hackathon object
  useEffect(() => {
    if (hackathons && selectedHackathonId) {
      const hackathon = hackathons.find(h => h.id === selectedHackathonId);
      setSelectedHackathon(hackathon);
    } else {
      setSelectedHackathon(undefined);
    }
  }, [hackathons, selectedHackathonId]);

  // Persist selected hackathon to localStorage
  useEffect(() => {
    if (selectedHackathonId) {
      localStorage.setItem('selectedHackathonId', selectedHackathonId.toString());
    }
  }, [selectedHackathonId]);

  // Check localStorage for previously selected hackathon on mount
  useEffect(() => {
    const storedHackathonId = localStorage.getItem('selectedHackathonId');
    if (storedHackathonId) {
      setSelectedHackathonId(parseInt(storedHackathonId));
    }
  }, []);

  return (
    <HackathonContext.Provider 
      value={{ 
        selectedHackathonId, 
        setSelectedHackathonId, 
        selectedHackathon,
        isLoading,
        error: error as Error | null
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
};

// Custom hook to use the hackathon context
export const useHackathonContext = () => {
  const context = useContext(HackathonContext);
  if (context === undefined) {
    throw new Error('useHackathonContext must be used within a HackathonProvider');
  }
  return context;
};
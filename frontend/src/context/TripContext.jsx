import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [searchCriteria, setSearchCriteria] = useState({
    startLocation: 'Bangalore',
    destination: 'Delhi',
    days: 3,
    budget: 15000,
    travelers: 2,
    date: '2026-10-15',
    preferredStartTime: '09:00',
    travelPreference: 'Historical & Couple',
    categories: ['Historical', 'Couple', 'Museum', 'Food'],
  });

  const [activeItinerary, setActiveItinerary] = useState(null);
  const [customTripBasket, setCustomTripBasket] = useState([]);

  const addPlaceToBasket = (place) => {
    setCustomTripBasket((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removePlaceFromBasket = (placeId) => {
    setCustomTripBasket((prev) => prev.filter((p) => p.id !== placeId));
  };

  return (
    <TripContext.Provider
      value={{
        searchCriteria,
        setSearchCriteria,
        activeItinerary,
        setActiveItinerary,
        customTripBasket,
        addPlaceToBasket,
        removePlaceFromBasket,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}

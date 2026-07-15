"use client";

import React, { createContext, useContext } from "react";

export interface ProfileData {
  restaurantName: string;
  branchAddress: string;
  currency: string;
  logoUrl?: string;
}

const ProfileContext = createContext<ProfileData | undefined>(undefined);

export function ProfileProvider({ 
  children, 
  initialProfile 
}: { 
  children: React.ReactNode;
  initialProfile: ProfileData;
}) {
  return (
    <ProfileContext.Provider value={initialProfile}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

// src/types/admin.ts
export type SponsorTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  logoUrl?: string;
}
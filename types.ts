export interface ApplicationFormData {
  nick: string;
  cid: string;
  phone: string;
  discord: string;
  docs: string;
}

export interface CandidateApplication extends ApplicationFormData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  createdProfileId?: string;
  source: string;
}

export interface CorporationMetrics {
  name: string;
  server: string;
  radioFrequency: string;
  treasuryBalance: number;
  weeklyGain: number;
  activeWorkersCount: number;
  pendingApplicationsCount: number;
  resourcePrices: {
    rock: number;
    wood: number;
    redFlower: number;
    blueFlower: number;
    pinkFlower: number;
  };
  totalMined: number;
}

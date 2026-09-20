export interface StitchingRate {
  category: string;
  item: string;
  price: number;
  currency: string;
  description: string;
  notes?: string;
}

export interface LibasKnowledge {
  brand: {
    name: string;
    subtitle: string;
    owner: string;
    ethos: string;
    establishedLocation: string;
    officialWebsite: string;
  };
  atelier: {
    physicalAddress: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    telephone: string;
    whatsappNumber: string;
    whatsappLink: string;
    googleMapsUrl: string;
    googleMapsShortShare: string;
    instagramUrl: string;
    instagramHandle: string;
    justdialUrl: string;
    hours: string;
  };
  stitchingRates: StitchingRate[];
  paymentPolicy: {
    advancePercentage: number;
    rule: string;
    balanceDue: string;
  };
  tailoringPhilosophy: {
    approach: string;
    acts: Array<{
      act: number;
      title: string;
      summary: string;
    }>;
  };
  measurementMetrology: {
    digitalToolUrl: string;
    description: string;
    points: string[];
    inPersonOption: string;
  };
  consultationRules: {
    disclaimer: string;
    options: string[];
  };
  humanEscalation: {
    ownerName: string;
    teamName: string;
    primaryContact: string;
    whatsappUrl: string;
    triggers: string[];
  };
}

export { LIBAS_KNOWLEDGE } from './knowledge.js';

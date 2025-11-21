
export type PresetType =
  | "Gardine"
  | "Tapete"
  | "Teppich"
  | "Accessoire"
  | "Möbel";

export type VisualizationMode =
  | "pattern"
  | "creativeWallColor"
  | "exactRAL";

export interface RALColor {
  code: string;
  name: string;
  hex: string;
}

export interface Variant {
  id: string;
  preset: PresetType | "Wandfarbe";
  imageUrl: string;
  createdAt: Date;
  comment?: string;
}

export interface CustomerData {
  customerName: string;  
  email: string; 
  phone?: string;
  address?: string;
  notes?: string;
  orderStatus?: "ja" | "nein" | "entscheidung" | "folgeangebot";
  orderAmount?: number | null;

  // Multi-Select 
  salesCategories: (
    | "Gardine"
    | "Tapete"
    | "Polster"
    | "Teppich"
    | "Zubehör"
    | "Komplettpaket"
  )[];
}

export interface ConsentData {
  accepted: boolean;
  signature?: string | null; // base64 PNG
  timestamp?: Date;
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  customerData?: CustomerData;
  consentData?: ConsentData;

  originalImage: string;
  patternImage: string;

  variants: Variant[];

  wallColor?: RALColor;
  brandingLogo?: string;
  notes?: string;
}
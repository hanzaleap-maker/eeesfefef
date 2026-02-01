// Service types
export type ServiceType = 'umzug' | 'transport' | 'entsorgung';
export type UmzugType = 'privat' | 'geschaeftlich';
export type TransportType = 'mobel' | 'waren' | 'sonstiges';
export type EntsorgungType = 'sperrmull' | 'haushaltsauflosung' | 'bauschutt' | 'gartenabfall' | 'elektro' | 'sonstiges';

// Form data structure
export interface FormData {
  // Service selection
  serviceType?: ServiceType;
  umzugType?: UmzugType;
  transportType?: TransportType;
  entsorgungType?: EntsorgungType;
  
  // Umzug details
  pickupAddress?: string;
  pickupZip?: string;
  pickupCity?: string;
  pickupFloor?: string;
  pickupElevator?: boolean;
  
  destinationAddress?: string;
  destinationZip?: string;
  destinationCity?: string;
  destinationFloor?: string;
  destinationElevator?: boolean;
  
  // Property details
  propertyType?: 'eigenheim' | 'mietwohnung';
  destinationPropertyType?: 'eigenheim' | 'mietwohnung';
  rooms?: string;
  livingSpace?: string;
  
  // Transport details
  transportItems?: string;
  transportWeight?: string;
  transportDimensions?: string;
  pickupDate?: string;
  flexibleDate?: boolean;
  
  // Entsorgung details
  wasteType?: string;
  wasteAmount?: string;
  wasteLocation?: string;
  
  // Common
  dateType?: 'fixed' | 'flexible';
  moveDate?: string;
  additionalInfo?: string;
  needsPacking?: boolean;
  needsStorage?: boolean;
  needsCleaning?: boolean;
  
  // Images
  images?: string[];
  
  // Contact
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

// Customer inquiry
export interface CustomerInquiry {
  id: string;
  timestamp: string;
  formData: FormData;
  status: 'new' | 'contacted' | 'completed';
}

// Admin credentials
export interface AdminCredentials {
  email: string;
  password: string;
}

// Admin settings
export interface AdminSettings {
  logoSize: number;
  datenschutzText: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}

export type FormType = 'APPLY' | 'KYC' | 'REPLACE';
export type CustomerCategory = 'INDIVIDUAL' | 'CORPORATE';
export type EntityType = 'PRIVATE_LIMITED' | 'PARTNERSHIP' | 'LLP' | 'PROPRIETORSHIP' | 'HUF';
export type VehicleType = 'PRIVATE' | 'COMMERCIAL';
export type Bank = 'IDFC' | 'SBI';
export type Plan = 'REGULAR' | 'MAX';
export type ReplacementReason = 'DAMAGED' | 'LOST' | 'BLACKLISTED' | 'OTHER';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Authentication {
  mobile: string;
  otp: string;
}

export interface IndividualData {
  fullName: string;
  dateOfBirth: string;
  email: string;
  address: Address;
  aadhaarNumber: string;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panNumber: string;
  panFront: File | null;
  panBack: File | null;
}

export interface AuthorizedSignatory {
  name: string;
  mobile: string;
  email: string;
  aadhaarFront: File | null;
  aadhaarBack: File | null;
  panFront: File | null;
  panBack: File | null;
}

export interface CorporateDocuments {
  entityId: File[];
  addressProof: File[];
  mandatory: File[];
}

export interface CorporateData {
  companyName: string;
  companyPan: string;
  gstin?: string;
  registeredAddress: Address;
  authorizedSignatory: AuthorizedSignatory;
  documents: CorporateDocuments;
}

export interface VehicleData {
  vehicleType: VehicleType;
  registrationNumber: string;
  chassisNumber: string;
  rcFront: File | null;
  rcBack: File | null;
  frontImage: File | null;
  sideImage: File | null;
}

export interface ProductData {
  bank: Bank;
  plan: Plan;
}

export interface ReplacementData {
  reason?: ReplacementReason;
  oldTagId?: string;
}

export interface Declarations {
  ovotAccepted: boolean;
  vahanVerified: boolean;
}

export interface FullFormData {
  formType: FormType;
  customerCategory: CustomerCategory;
  entityType?: EntityType;
  authentication: Authentication;
  individual?: IndividualData;
  corporate?: CorporateData;
  vehicle: VehicleData;
  product: ProductData;
  replacement?: ReplacementData;
  declarations: Declarations;
}

/** Document matrix helper – use this on the frontend to decide which docs to show */
export const ENTITY_DOCUMENT_MATRIX: Record<EntityType, {
  entityId: string[];
  addressProof: string[];
  mandatory: string[];
}> = {
  PRIVATE_LIMITED: {
    entityId: ['Certificate of Incorporation', 'MOA', 'AOA'],
    addressProof: ['Utility Bill', 'Lease Agreement', 'Bank Statement'],
    mandatory: ['Board Resolution', 'List of Directors']
  },
  PARTNERSHIP: {
    entityId: ['Partnership Deed', 'Registration Certificate'],
    addressProof: ['Utility Bill', 'Lease Agreement'],
    mandatory: ['Partner KYC', 'Authorization Letter']
  },
  LLP: {
    entityId: ['LLP Agreement', 'Certificate of Incorporation'],
    addressProof: ['Utility Bill', 'Lease Agreement'],
    mandatory: ['Designated Partner List', 'Authorization Letter']
  },
  PROPRIETORSHIP: {
    entityId: ['Shop & Establishment Certificate', 'GST Certificate'],
    addressProof: ['Utility Bill', 'Rental Agreement'],
    mandatory: ['Proprietor KYC']
  },
  HUF: {
    entityId: ['HUF Deed', 'PAN Card of HUF'],
    addressProof: ['Utility Bill', 'Bank Statement'],
    mandatory: ['Karta KYC', 'List of Coparceners']
  }
};

export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type BookingStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'WORKER_ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAYMENT_RELEASED'
  | 'RATED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CASH' | 'NET_BANKING' | 'CARD';
export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory =
  | 'WORKER_BEHAVIOR'
  | 'SERVICE_QUALITY'
  | 'PAYMENT_ISSUE'
  | 'LATE_ARRIVAL'
  | 'WRONG_PRICING'
  | 'BILLING'
  | 'BEHAVIOR'
  | 'DELAY'
  | 'SAFETY'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  language: string;
  createdAt: string;
  customer?: Customer;
  worker?: Worker;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNo: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  totalWorkers: number;
}

export interface Service {
  id: string;
  name: string;
  nameHi?: string;
  nameMr?: string;
  description?: string;
  icon?: string;
  category: string;
  basePrice: number;
  emergencyPrice?: number;
  estimatedDuration: number;
  workerCommission: number;
  cooperativeShare: number;
  platformFee: number;
  isActive: boolean;
  isEmergency: boolean;
}

export interface Worker {
  id: string;
  userId: string;
  cooperativeId?: string;
  cooperative?: Cooperative;
  avatarUrl?: string;
  bio?: string;
  experience: number;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  serviceRadiusKm: number;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  totalEarnings: number;
  totalJobs: number;
  averageRating: number;
  ratingCount: number;
  currentWorkload: number;
  languages: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  skills?: {
    id: string;
    level: string;
    service: Service;
  }[];
  welfare?: {
    pensionActive: boolean;
    pensionContribution: number;
    healthBenefitEligible: boolean;
    trainingCompleted: number;
    documentsVerified: boolean;
  };
  insurance?: {
    isActive: boolean;
    policyNumber?: string;
    provider?: string;
    accidentalCoverage: number;
    healthCoverage: number;
  };
}

export interface Customer {
  id: string;
  userId: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  customer?: Customer;
  workerId?: string;
  worker?: Worker;
  serviceId: string;
  service?: Service;
  status: BookingStatus;
  isEmergency: boolean;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string;
  scheduledTime: string;
  description?: string;
  serviceCharge: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  workerEarning: number;
  cooperativeShare: number;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  statusHistory?: {
    id: string;
    status: BookingStatus;
    note?: string;
    createdAt: string;
  }[];
  payment?: Payment;
  invoice?: Invoice;
  rating?: Rating;
  complaint?: Complaint;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  serviceCharge: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  workerEarning: number;
  cooperativeShare: number;
  issuedAt: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  workerId: string;
  score: number;
  createdAt: string;
}

export interface Review {
  id: string;
  workerId: string;
  customerName: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  bookingId: string;
  customerId: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  resolutionNote?: string;
  createdAt: string;
  booking?: Booking;
  customer?: Customer;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

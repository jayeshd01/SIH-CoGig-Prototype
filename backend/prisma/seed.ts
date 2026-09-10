import { PrismaClient } from '@prisma/client';
import { UserRole, VerificationStatus, BookingStatus, PaymentStatus, PaymentMethod, ComplaintCategory, DocumentType } from '../src/common/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.workerAllocation.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workerInsurance.deleteMany();
  await prisma.workerWelfare.deleteMany();
  await prisma.workerAvailability.deleteMany();
  await prisma.workerDocument.deleteMany();
  await prisma.workerCertification.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.address.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.setting.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@123', 12);

  // ─── COOPERATIVES ────────────────────────────────────────────────────────
  console.log('Creating cooperatives...');
  const cooperatives = await Promise.all([
    prisma.cooperative.create({
      data: {
        name: 'Shakti Labour Cooperative',
        registrationNo: 'MH-COOP-2019-4521',
        address: 'Shivaji Nagar, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543210',
        email: 'info@shaktilabour.coop',
        description: 'A cooperative of skilled electricians and plumbers serving Pune since 2019.',
        isActive: true,
      },
    }),
    prisma.cooperative.create({
      data: {
        name: 'Sahara Shramik Sangh',
        registrationNo: 'MH-COOP-2018-3312',
        address: 'Kothrud, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543211',
        email: 'contact@saharashramik.coop',
        description: 'Community of carpenters, painters and domestic workers in western Pune.',
        isActive: true,
      },
    }),
    prisma.cooperative.create({
      data: {
        name: 'Nirmaan Workers Cooperative',
        registrationNo: 'MH-COOP-2020-6789',
        address: 'Hadapsar, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        phone: '9876543212',
        email: 'hello@nirmaanworkers.coop',
        description: 'Technicians, drivers and caregivers cooperative serving eastern Pune.',
        isActive: true,
      },
    }),
  ]);

  // ─── SERVICES ────────────────────────────────────────────────────────────
  console.log('Creating services...');
  const servicesData = [
    { name: 'Electrical', nameHi: 'बिजली', nameMr: 'विद्युत', category: 'electrical', icon: 'Zap', basePrice: 299, emergencyPrice: 499, description: 'Wiring, switches, fan installation, circuit repair', descriptionHi: 'वायरिंग, स्विच, पंखा लगाना, सर्किट मरम्मत', descriptionMr: 'वायरिंग, स्विच, पंखा बसवणे, सर्किट दुरुस्ती' },
    { name: 'Plumbing', nameHi: 'प्लंबिंग', nameMr: 'प्लंबिंग', category: 'plumbing', icon: 'Droplets', basePrice: 249, emergencyPrice: 449, description: 'Pipe repair, tap fitting, drainage, water tank' },
    { name: 'Carpentry', nameHi: 'बढ़ईगिरी', nameMr: 'सुतारकाम', category: 'carpentry', icon: 'Hammer', basePrice: 399, description: 'Furniture repair, door fixing, woodwork' },
    { name: 'Painting', nameHi: 'पेंटिंग', nameMr: 'रंगकाम', category: 'painting', icon: 'Paintbrush', basePrice: 499, description: 'Interior painting, wall textures, waterproofing' },
    { name: 'Cleaning', nameHi: 'सफाई', nameMr: 'स्वच्छता', category: 'cleaning', icon: 'Sparkles', basePrice: 199, description: 'Deep cleaning, kitchen cleaning, bathroom cleaning' },
    { name: 'Gardening', nameHi: 'बागवानी', nameMr: 'बागकाम', category: 'gardening', icon: 'Flower2', basePrice: 199, description: 'Garden maintenance, plant care, lawn mowing' },
    { name: 'Driver', nameHi: 'ड्राइवर', nameMr: 'चालक', category: 'driver', icon: 'Car', basePrice: 349, description: 'Personal driver, outstation, daily commute' },
    { name: 'Caregiving', nameHi: 'देखभाल', nameMr: 'काळजी', category: 'caregiving', icon: 'Heart', basePrice: 449, description: 'Elder care, patient care, child care' },
    { name: 'Domestic Help', nameHi: 'घरेलू सहायता', nameMr: 'घरकाम', category: 'domestic', icon: 'Home', basePrice: 199, description: 'Cooking, cleaning, laundry, household chores' },
    { name: 'Appliance Repair', nameHi: 'उपकरण मरम्मत', nameMr: 'उपकरण दुरुस्ती', category: 'appliance', icon: 'Wrench', basePrice: 349, emergencyPrice: 549, description: 'AC, washing machine, refrigerator, geyser repair' },
    { name: 'Technician', nameHi: 'तकनीशियन', nameMr: 'तंत्रज्ञ', category: 'technician', icon: 'Settings', basePrice: 299, description: 'Computer repair, CCTV, networking, TV mounting' },
    { name: 'Emergency Services', nameHi: 'आपातकालीन सेवा', nameMr: 'आणीबाणी सेवा', category: 'emergency', icon: 'AlertTriangle', basePrice: 499, emergencyPrice: 799, description: 'Urgent repairs for electrical, plumbing, lock issues', isEmergency: true },
  ];

  const services = await Promise.all(
    servicesData.map(s =>
      prisma.service.create({
        data: {
          ...s,
          estimatedDuration: 60,
          workerCommission: 0.80,
          cooperativeShare: 0.10,
          platformFee: 0.10,
        },
      })
    )
  );

  // ─── DEMO ACCOUNTS ──────────────────────────────────────────────────────
  console.log('Creating demo accounts...');

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      phone: '9000000001',
      passwordHash,
      role: UserRole.ADMIN,
      firstName: 'Priya',
      lastName: 'Sharma',
      language: 'en',
    },
  });

  // Demo customer
  const demoCustomerUser = await prisma.user.create({
    data: {
      email: 'customer@demo.com',
      phone: '9000000002',
      passwordHash,
      role: UserRole.CUSTOMER,
      firstName: 'Anita',
      lastName: 'Deshmukh',
      language: 'en',
    },
  });
  const demoCustomer = await prisma.customer.create({
    data: {
      userId: demoCustomerUser.id,
      latitude: 18.5204,
      longitude: 73.8567,
      addressText: '45, MG Road, Shivaji Nagar, Pune 411005',
    },
  });
  await prisma.address.create({
    data: {
      customerId: demoCustomer.id,
      label: 'Home',
      addressLine1: '45, MG Road',
      addressLine2: 'Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      latitude: 18.5204,
      longitude: 73.8567,
      isDefault: true,
    },
  });

  // Demo worker
  const demoWorkerUser = await prisma.user.create({
    data: {
      email: 'worker@demo.com',
      phone: '9000000003',
      passwordHash,
      role: UserRole.WORKER,
      firstName: 'Rajesh',
      lastName: 'Patil',
      language: 'hi',
    },
  });
  const demoWorker = await prisma.worker.create({
    data: {
      userId: demoWorkerUser.id,
      cooperativeId: cooperatives[0].id,
      bio: 'Experienced electrician with 8 years of expertise in residential and commercial electrical work. Certified by Maharashtra State Electricity Board.',
      experience: 8,
      latitude: 18.5314,
      longitude: 73.8446,
      addressText: 'Near PMC Office, Shivaji Nagar, Pune',
      serviceRadiusKm: 12,
      verificationStatus: VerificationStatus.VERIFIED,
      isAvailable: true,
      totalEarnings: 185400,
      totalJobs: 126,
      averageRating: 4.8,
      ratingCount: 98,
      currentWorkload: 2,
      languages: 'en,hi,mr',
    },
  });

  // Worker skills
  await prisma.workerSkill.createMany({
    data: [
      { workerId: demoWorker.id, serviceId: services[0].id, level: 'expert' },
      { workerId: demoWorker.id, serviceId: services[9].id, level: 'intermediate' },
    ],
  });

  // Worker certifications
  await prisma.workerCertification.create({
    data: {
      workerId: demoWorker.id,
      name: 'Electrical Wiring Certificate',
      issuingAuthority: 'Maharashtra State Electricity Board',
      issueDate: new Date('2020-06-15'),
      isVerified: true,
    },
  });

  // Worker documents
  await prisma.workerDocument.createMany({
    data: [
      { workerId: demoWorker.id, documentType: DocumentType.AADHAAR, documentUrl: '/docs/masked', maskedId: 'XXXX-XXXX-4521', isVerified: true, verifiedAt: new Date() },
      { workerId: demoWorker.id, documentType: DocumentType.SKILL_CERTIFICATE, documentUrl: '/docs/cert', isVerified: true, verifiedAt: new Date() },
      { workerId: demoWorker.id, documentType: DocumentType.COOPERATIVE_MEMBERSHIP, documentUrl: '/docs/membership', isVerified: true, verifiedAt: new Date() },
    ],
  });

  // Worker availability
  for (let day = 0; day < 7; day++) {
    await prisma.workerAvailability.create({
      data: { workerId: demoWorker.id, dayOfWeek: day, startTime: '08:00', endTime: '20:00', isActive: day < 6 },
    });
  }

  // Worker welfare & insurance
  await prisma.workerWelfare.create({
    data: {
      workerId: demoWorker.id,
      pensionActive: true,
      pensionContribution: 2400,
      healthBenefitEligible: true,
      trainingCompleted: 3,
      documentsVerified: true,
    },
  });
  await prisma.workerInsurance.create({
    data: {
      workerId: demoWorker.id,
      isActive: true,
      policyNumber: 'INS-SHK-2024-0045',
      provider: 'National Insurance Co.',
      accidentalCoverage: 500000,
      healthCoverage: 200000,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
    },
  });

  // ─── ADDITIONAL WORKERS ──────────────────────────────────────────────────
  console.log('Creating additional workers...');

  const workerProfiles = [
    { first: 'Suresh', last: 'Jadhav', email: 'suresh.j@demo.com', phone: '9100000001', coop: 0, skill: [1], exp: 6, lat: 18.5084, lng: 73.8292, rating: 4.6, jobs: 89, earnings: 134500, bio: 'Expert plumber with experience in both residential and commercial projects.' },
    { first: 'Manoj', last: 'Kulkarni', email: 'manoj.k@demo.com', phone: '9100000002', coop: 1, skill: [2], exp: 10, lat: 18.5084, lng: 73.8070, rating: 4.9, jobs: 156, earnings: 245600, bio: 'Master carpenter with 10 years of furniture and woodwork expertise.' },
    { first: 'Ganesh', last: 'More', email: 'ganesh.m@demo.com', phone: '9100000003', coop: 0, skill: [0, 10], exp: 5, lat: 18.5362, lng: 73.8903, rating: 4.5, jobs: 67, earnings: 98700, bio: 'Electrician and technician handling residential wiring and smart home setup.' },
    { first: 'Vijay', last: 'Shinde', email: 'vijay.s@demo.com', phone: '9100000004', coop: 2, skill: [6], exp: 7, lat: 18.5018, lng: 73.9263, rating: 4.7, jobs: 145, earnings: 198900, bio: 'Professional driver with clean record and outstation experience.' },
    { first: 'Arun', last: 'Kadam', email: 'arun.k@demo.com', phone: '9100000005', coop: 1, skill: [3], exp: 12, lat: 18.5097, lng: 73.8195, rating: 4.8, jobs: 203, earnings: 345600, bio: 'Interior painter specializing in textures and waterproofing.' },
    { first: 'Santosh', last: 'Pawar', email: 'santosh.p@demo.com', phone: '9100000006', coop: 0, skill: [4], exp: 4, lat: 18.5280, lng: 73.8512, rating: 4.4, jobs: 52, earnings: 67800, bio: 'Professional deep cleaning services for homes and offices.' },
    { first: 'Prashant', last: 'Gaikwad', email: 'prashant.g@demo.com', phone: '9100000007', coop: 2, skill: [7], exp: 3, lat: 18.4986, lng: 73.9432, rating: 4.6, jobs: 38, earnings: 45600, bio: 'Caring and patient caregiver for elderly and children.' },
    { first: 'Ramesh', last: 'Bhosale', email: 'ramesh.b@demo.com', phone: '9100000008', coop: 1, skill: [5], exp: 8, lat: 18.5167, lng: 73.8051, rating: 4.3, jobs: 78, earnings: 89700, bio: 'Gardener with expertise in terrace gardens and landscape design.' },
    { first: 'Dinesh', last: 'Yadav', email: 'dinesh.y@demo.com', phone: '9100000009', coop: 0, skill: [1, 0], exp: 9, lat: 18.5450, lng: 73.8600, rating: 4.7, jobs: 112, earnings: 167800, bio: 'Plumber and electrician, versatile home repair professional.' },
    { first: 'Amit', last: 'Thorat', email: 'amit.t@demo.com', phone: '9100000010', coop: 2, skill: [9], exp: 6, lat: 18.4892, lng: 73.9150, rating: 4.5, jobs: 84, earnings: 112300, bio: 'Appliance repair specialist - AC, washing machine, refrigerator.' },
    { first: 'Sanjay', last: 'Mane', email: 'sanjay.m@demo.com', phone: '9100000011', coop: 0, skill: [10], exp: 5, lat: 18.5340, lng: 73.8780, rating: 4.4, jobs: 61, earnings: 78900, bio: 'Computer and networking technician, CCTV installation.' },
    { first: 'Ravi', last: 'Deshpande', email: 'ravi.d@demo.com', phone: '9100000012', coop: 1, skill: [8], exp: 4, lat: 18.5120, lng: 73.8300, rating: 4.6, jobs: 92, earnings: 98400, bio: 'Domestic help services - cooking, cleaning, and household management.' },
    { first: 'Kiran', last: 'Salunkhe', email: 'kiran.s@demo.com', phone: '9100000013', coop: 2, skill: [0], exp: 3, lat: 18.4950, lng: 73.9020, rating: 4.2, jobs: 28, earnings: 34500, bio: 'Young electrician learning the trade, reliable and punctual.' },
    { first: 'Deepak', last: 'Joshi', email: 'deepak.j@demo.com', phone: '9100000014', coop: 0, skill: [2, 3], exp: 15, lat: 18.5400, lng: 73.8400, rating: 4.9, jobs: 267, earnings: 456000, bio: 'Master craftsman in carpentry and painting with 15 years experience.' },
    { first: 'Mahesh', last: 'Wagh', email: 'mahesh.w@demo.com', phone: '9100000015', coop: 1, skill: [1], exp: 7, lat: 18.5050, lng: 73.8150, rating: 4.5, jobs: 95, earnings: 145600, bio: 'Plumbing specialist for new constructions and renovations.' },
    { first: 'Nitin', last: 'Chavan', email: 'nitin.c@demo.com', phone: '9100000016', coop: 2, skill: [6, 7], exp: 6, lat: 18.5000, lng: 73.9350, rating: 4.7, jobs: 88, earnings: 134500, bio: 'Driver and caregiver, specialized in medical appointments transport.' },
    { first: 'Prakash', last: 'Sawant', email: 'prakash.s@demo.com', phone: '9100000017', coop: 0, skill: [4, 8], exp: 5, lat: 18.5250, lng: 73.8650, rating: 4.3, jobs: 56, earnings: 67800, bio: 'Cleaning and domestic services professional.' },
    { first: 'Tushar', last: 'Kale', email: 'tushar.k@demo.com', phone: '9100000018', coop: 1, skill: [9, 10], exp: 8, lat: 18.5180, lng: 73.8080, rating: 4.6, jobs: 134, earnings: 198700, bio: 'Appliance repair and IT technician with extensive experience.' },
    { first: 'Yogesh', last: 'Nikam', email: 'yogesh.n@demo.com', phone: '9100000019', coop: 2, skill: [0, 9], exp: 4, lat: 18.4920, lng: 73.9200, rating: 4.4, jobs: 41, earnings: 56700, bio: 'Electrician with specialization in AC and appliance repair.' },
    // Pending verification workers
    { first: 'Ashok', last: 'Kamble', email: 'ashok.k@demo.com', phone: '9100000020', coop: 0, skill: [1], exp: 2, lat: 18.5300, lng: 73.8500, rating: 0, jobs: 0, earnings: 0, bio: 'New plumber seeking verification.', verified: false },
    { first: 'Sagar', last: 'Londhe', email: 'sagar.l@demo.com', phone: '9100000021', coop: 1, skill: [0], exp: 1, lat: 18.5100, lng: 73.8200, rating: 0, jobs: 0, earnings: 0, bio: 'Aspiring electrician from Sahara Shramik Sangh.', verified: false },
    { first: 'Vaibhav', last: 'Ghorpade', email: 'vaibhav.g@demo.com', phone: '9100000022', coop: 2, skill: [4], exp: 3, lat: 18.4980, lng: 73.9100, rating: 0, jobs: 0, earnings: 0, bio: 'Experienced cleaner applying for platform verification.', verified: false },
  ];

  const createdWorkers = [demoWorker];

  for (const wp of workerProfiles) {
    const user = await prisma.user.create({
      data: {
        email: wp.email,
        phone: wp.phone,
        passwordHash,
        role: UserRole.WORKER,
        firstName: wp.first,
        lastName: wp.last,
        language: 'hi',
      },
    });

    const worker = await prisma.worker.create({
      data: {
        userId: user.id,
        cooperativeId: cooperatives[wp.coop].id,
        bio: wp.bio,
        experience: wp.exp,
        latitude: wp.lat,
        longitude: wp.lng,
        serviceRadiusKm: 10 + Math.random() * 5,
        verificationStatus: wp.verified === false ? VerificationStatus.PENDING : VerificationStatus.VERIFIED,
        isAvailable: true,
        totalEarnings: wp.earnings,
        totalJobs: wp.jobs,
        averageRating: wp.rating,
        ratingCount: Math.floor(wp.jobs * 0.7),
        currentWorkload: Math.floor(Math.random() * 3),
        languages: 'hi,mr',
      },
    });

    for (const skillIdx of wp.skill) {
      await prisma.workerSkill.create({
        data: { workerId: worker.id, serviceId: services[skillIdx].id, level: wp.exp > 7 ? 'expert' : 'intermediate' },
      });
    }

    if (wp.verified !== false) {
      await prisma.workerWelfare.create({
        data: {
          workerId: worker.id,
          pensionActive: Math.random() > 0.3,
          pensionContribution: Math.floor(Math.random() * 5000),
          healthBenefitEligible: Math.random() > 0.2,
          trainingCompleted: Math.floor(Math.random() * 5),
          documentsVerified: true,
        },
      });
      await prisma.workerInsurance.create({
        data: {
          workerId: worker.id,
          isActive: true,
          provider: 'National Insurance Co.',
          accidentalCoverage: 500000,
          healthCoverage: 200000,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
        },
      });
    }

    createdWorkers.push(worker);
  }

  // ─── ADDITIONAL CUSTOMERS ────────────────────────────────────────────────
  console.log('Creating customers...');
  const customerNames = [
    { first: 'Sneha', last: 'Joshi', lat: 18.5204, lng: 73.8567 },
    { first: 'Meera', last: 'Kulkarni', lat: 18.5084, lng: 73.8292 },
    { first: 'Pooja', last: 'Patil', lat: 18.5362, lng: 73.8903 },
    { first: 'Rohit', last: 'Deshpande', lat: 18.5018, lng: 73.9263 },
    { first: 'Sachin', last: 'Shinde', lat: 18.5097, lng: 73.8195 },
    { first: 'Sunita', last: 'More', lat: 18.5280, lng: 73.8512 },
    { first: 'Anil', last: 'Kadam', lat: 18.4986, lng: 73.9432 },
    { first: 'Kavita', last: 'Pawar', lat: 18.5167, lng: 73.8051 },
    { first: 'Vishal', last: 'Gaikwad', lat: 18.5450, lng: 73.8600 },
    { first: 'Deepa', last: 'Bhosale', lat: 18.4892, lng: 73.9150 },
    { first: 'Rahul', last: 'Mane', lat: 18.5340, lng: 73.8780 },
    { first: 'Swati', last: 'Thorat', lat: 18.5120, lng: 73.8300 },
    { first: 'Nilesh', last: 'Salunkhe', lat: 18.4950, lng: 73.9020 },
    { first: 'Ashwini', last: 'Jadhav', lat: 18.5400, lng: 73.8400 },
    { first: 'Sandip', last: 'Wagh', lat: 18.5050, lng: 73.8150 },
    { first: 'Manisha', last: 'Chavan', lat: 18.5000, lng: 73.9350 },
    { first: 'Varun', last: 'Sawant', lat: 18.5250, lng: 73.8650 },
    { first: 'Priyanka', last: 'Kale', lat: 18.5180, lng: 73.8080 },
    { first: 'Ajay', last: 'Nikam', lat: 18.4920, lng: 73.9200 },
    { first: 'Rekha', last: 'Kamble', lat: 18.5300, lng: 73.8500 },
  ];

  const customers = [demoCustomer];
  for (let i = 0; i < customerNames.length; i++) {
    const cn = customerNames[i];
    const user = await prisma.user.create({
      data: {
        email: `${cn.first.toLowerCase()}.${cn.last.toLowerCase()}@example.com`,
        phone: `92000000${String(i + 10).padStart(2, '0')}`,
        passwordHash,
        role: UserRole.CUSTOMER,
        firstName: cn.first,
        lastName: cn.last,
      },
    });
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        latitude: cn.lat,
        longitude: cn.lng,
        addressText: `${Math.floor(Math.random() * 200) + 1}, Pune, Maharashtra`,
      },
    });
    customers.push(customer);
  }

  // ─── BOOKINGS ────────────────────────────────────────────────────────────
  console.log('Creating bookings...');

  const statuses: BookingStatus[] = [
    BookingStatus.RATED, BookingStatus.RATED, BookingStatus.RATED,
    BookingStatus.PAYMENT_RELEASED, BookingStatus.COMPLETED,
    BookingStatus.IN_PROGRESS, BookingStatus.ACCEPTED,
    BookingStatus.REQUESTED,
  ];

  const verifiedWorkers = createdWorkers.filter((_, idx) => idx < createdWorkers.length - 3);

  for (let i = 0; i < 120; i++) {
    const customer = customers[i % customers.length];
    const worker = verifiedWorkers[i % verifiedWorkers.length];
    const service = services[i % (services.length - 1)]; // Exclude emergency
    const status = statuses[i % statuses.length];
    const daysAgo = Math.floor(Math.random() * 60);
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - daysAgo);

    const basePrice = service.basePrice;
    const platformFee = Math.round(basePrice * 0.10 * 100) / 100;
    const totalAmount = basePrice + platformFee;
    const workerEarning = Math.round(basePrice * 0.80 * 100) / 100;
    const cooperativeShare = Math.round(basePrice * 0.10 * 100) / 100;

    const isCompleted = ['COMPLETED', 'PAYMENT_RELEASED', 'RATED'].includes(status);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.id,
        serviceId: service.id,
        status,
        addressText: `${Math.floor(Math.random() * 200) + 1}, Pune, Maharashtra`,
        latitude: 18.5 + (Math.random() * 0.06 - 0.03),
        longitude: 73.8 + (Math.random() * 0.15 - 0.05),
        scheduledDate,
        scheduledTime: `${8 + Math.floor(Math.random() * 12)}:00`,
        description: `${service.name} service needed`,
        serviceCharge: basePrice,
        platformFee,
        taxAmount: 0,
        totalAmount,
        workerEarning,
        cooperativeShare,
        startedAt: isCompleted ? new Date(scheduledDate.getTime() + 3600000) : null,
        completedAt: isCompleted ? new Date(scheduledDate.getTime() + 7200000) : null,
        statusHistory: {
          create: { status, changedBy: customer.id },
        },
      },
    });

    // Payment for completed bookings
    if (['PAYMENT_RELEASED', 'RATED'].includes(status)) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalAmount,
          method: [PaymentMethod.UPI, PaymentMethod.CARD, PaymentMethod.CASH][i % 3],
          status: PaymentStatus.PAID,
          transactionId: `TXN-${String(i + 1).padStart(8, '0')}`,
          paidAt: new Date(scheduledDate.getTime() + 7200000),
        },
      });

      await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: `SAH-2024-${String(i + 1).padStart(6, '0')}`,
          serviceCharge: basePrice,
          platformFee,
          taxAmount: 0,
          totalAmount,
          workerEarning,
          cooperativeShare,
        },
      });
    }

    // Ratings for RATED bookings
    if (status === BookingStatus.RATED) {
      const score = 3 + Math.floor(Math.random() * 3);
      await prisma.rating.create({
        data: { bookingId: booking.id, workerId: worker.id, score },
      });

      const comments = [
        'Very professional and punctual.',
        'Good work, satisfied with the service.',
        'Excellent service! Highly recommended.',
        'Did a decent job. Could improve communication.',
        'Great work, very skilled professional.',
        'On time and efficient. Will book again.',
      ];

      await prisma.review.create({
        data: {
          workerId: worker.id,
          customerName: `Customer ${i + 1}`,
          score,
          comment: comments[i % comments.length],
        },
      });
    }
  }

  // ─── COMPLAINTS ──────────────────────────────────────────────────────────
  console.log('Creating sample complaints...');
  const someBookings = await prisma.booking.findMany({ take: 5, where: { status: BookingStatus.RATED } });
  for (let i = 0; i < Math.min(3, someBookings.length); i++) {
    const b = someBookings[i];
    await prisma.complaint.create({
      data: {
        bookingId: b.id,
        customerId: b.customerId,
        category: [ComplaintCategory.LATE_ARRIVAL, ComplaintCategory.SERVICE_QUALITY, ComplaintCategory.WRONG_PRICING][i],
        description: ['Worker arrived 30 minutes late.', 'Work quality was not satisfactory.', 'Charged more than the quoted price.'][i],
        status: i === 0 ? 'RESOLVED' : 'OPEN',
        resolutionNote: i === 0 ? 'Apology issued and partial refund processed.' : null,
      },
    });
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: demoCustomerUser.id, title: 'Welcome to Sahyog!', message: 'Book your first service and experience trusted cooperative workers.', type: 'WELCOME' },
      { userId: demoCustomerUser.id, title: 'Service Completed', message: 'Your Electrical service has been completed. Please rate your experience.', type: 'BOOKING_UPDATE' },
      { userId: demoWorkerUser.id, title: 'Welcome, Rajesh!', message: 'Your profile is verified. You can now receive job requests.', type: 'WELCOME' },
      { userId: demoWorkerUser.id, title: 'New Job Request', message: 'You have a new Plumbing job request from Anita Deshmukh.', type: 'BOOKING_REQUEST' },
      { userId: demoWorkerUser.id, title: 'Payment Received', message: 'You earned ₹320 for Electrical service.', type: 'PAYMENT' },
      { userId: adminUser.id, title: 'New Worker Registration', message: 'Ashok Kamble has registered and is pending verification.', type: 'VERIFICATION' },
      { userId: adminUser.id, title: 'Complaint Filed', message: 'A new complaint has been filed for booking.', type: 'COMPLAINT' },
    ],
  });

  // ─── DEMAND FORECASTS ────────────────────────────────────────────────────
  console.log('Creating demand forecasts...');
  const zones = ['Pune West', 'Pune East', 'Pune North', 'Pune South', 'Pune Central'];
  const categories = ['electrical', 'plumbing', 'cleaning', 'carpentry', 'appliance'];
  const levels = ['High', 'Medium', 'Low'];

  for (const zone of zones) {
    for (const cat of categories) {
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        await prisma.demandForecast.create({
          data: {
            zone,
            serviceCategory: cat,
            date,
            predictedDemand: Math.floor(Math.random() * 20) + 2,
            demandLevel: levels[Math.floor(Math.random() * 3)],
            confidence: 0.6 + Math.random() * 0.35,
            recommendation: d === 0 ? `Consider allocating ${Math.floor(Math.random() * 5) + 3} additional ${cat} workers between 5 PM–9 PM.` : null,
          },
        });
      }
    }
  }

  // ─── SETTINGS ────────────────────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: 'worker_commission', value: '0.80' },
      { key: 'cooperative_share', value: '0.10' },
      { key: 'platform_fee', value: '0.10' },
      { key: 'emergency_surcharge', value: '1.5' },
      { key: 'max_service_radius_km', value: '25' },
    ],
  });

  // Update cooperative worker counts
  for (const coop of cooperatives) {
    const count = await prisma.worker.count({ where: { cooperativeId: coop.id } });
    await prisma.cooperative.update({ where: { id: coop.id }, data: { totalWorkers: count } });
  }

  console.log('✅ Seed completed!');
  console.log('Demo accounts:');
  console.log('  Customer: customer@demo.com / Demo@123');
  console.log('  Worker:   worker@demo.com / Demo@123');
  console.log('  Admin:    admin@demo.com / Demo@123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

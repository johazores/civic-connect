import bcrypt from 'bcryptjs';

const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => any };

const prisma = new PrismaClient();

const runtimeSettings = [
  {
    key: 'NEXT_PUBLIC_APP_URL',
    value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    category: 'APP',
    description: 'Canonical deployed app URL used for links, callbacks, and metadata.'
  },
  {
    key: 'NEXT_PUBLIC_AUTH_PROVIDER',
    value: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'custom',
    category: 'AUTH',
    description: 'Authentication provider flag. Keep custom until Clerk migration is active.'
  },
  {
    key: 'STELLAR_NETWORK',
    value: process.env.STELLAR_NETWORK || 'TESTNET',
    category: 'STELLAR',
    description: 'Default Stellar network for non-tenant playground and fallback flows.'
  },
  {
    key: 'STELLAR_HORIZON_URL',
    value: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    category: 'STELLAR',
    description: 'Default Stellar Horizon endpoint.'
  },
  {
    key: 'STELLAR_FRIENDBOT_URL',
    value: process.env.STELLAR_FRIENDBOT_URL || 'https://friendbot.stellar.org',
    category: 'STELLAR',
    description: 'Default Stellar Testnet Friendbot endpoint.'
  },
  {
    key: 'STELLAR_NETWORK_PASSPHRASE',
    value: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    category: 'STELLAR',
    description: 'Default Stellar network passphrase.'
  }
] as const;

const tenantConfigs = [
  {
    slug: 'metro-city',
    orgType: 'GOVERNMENT',
    name: 'Metro City Services',
    cityName: 'Metro City',
    tagline: 'Trusted city services in one clear portal.',
    description:
      'Report local concerns, track requests, browse services, read announcements, and contact the right office from a modern citizen service platform.',
    address: 'Metro City Government Center, Philippines',
    email: 'citizen.services@metrocity.gov.ph',
    phone: '+63 2 8842 1100',
    primaryColor: '#2563eb',
    stellarReceivingPublicKey: null,
    admin: { name: 'Operations Administrator', email: 'admin@metrocity.local' },
    citizen: { name: 'Sofia Cruz', email: 'sofia.cruz@metrocity.local', phone: '+63 917 428 1934' },
    departments: [
      { name: 'Citizen Services Office', email: 'citizen.services@metrocity.gov.ph', phone: '+63 2 8842 1100' },
      { name: 'Public Works Department', email: 'public.works@metrocity.gov.ph', phone: '+63 2 8842 1200' },
      { name: 'Environment and Sanitation Office', email: 'sanitation@metrocity.gov.ph', phone: '+63 2 8842 1300' },
      { name: 'Public Safety Office', email: 'public.safety@metrocity.gov.ph', phone: '+63 2 8842 1400' },
      { name: 'Business Permits Office', email: 'permits@metrocity.gov.ph', phone: '+63 2 8842 1500' }
    ],
    categories: [
      ['Road and Sidewalk', 'Potholes, damaged sidewalks, road hazards, and pedestrian access concerns.'],
      ['Streetlight and Utilities', 'Broken streetlights, exposed wires, damaged posts, and public utility concerns.'],
      ['Waste and Sanitation', 'Missed collection, illegal dumping, clogged drainage, and cleanup concerns.'],
      ['Public Safety', 'Safety hazards, damaged barriers, unsafe public areas, and urgent local concerns.'],
      ['Permits and Services', 'Business permits, public documents, service counters, and request routing.']
    ],
    services: [
      { title: 'Business Permit Assistance', description: 'Start or renew local business permit requests and find the required office checklist.', department: 'Business Permits Office', linkUrl: '', sortOrder: 1, paymentRequired: true, feeAmount: '25.0000000', feeAssetCode: 'XLM' },
      { title: 'Real Property Tax Information', description: 'Find assessment guidance, payment instructions, and document requirements for property-related concerns.', department: 'Citizen Services Office', linkUrl: '', sortOrder: 2, paymentRequired: true, feeAmount: '15.0000000', feeAssetCode: 'XLM' },
      { title: 'Citizen Charter and Forms', description: 'Access service standards, public forms, request requirements, and processing information.', department: 'Citizen Services Office', linkUrl: '', sortOrder: 3, paymentRequired: false, feeAmount: null, feeAssetCode: 'XLM' },
      { title: 'Road and Drainage Requests', description: 'Route road, drainage, sidewalk, and facility concerns to the public works team.', department: 'Public Works Department', linkUrl: '', sortOrder: 4, paymentRequired: false, feeAmount: null, feeAssetCode: 'XLM' },
      { title: 'Environmental Services', description: 'Request waste collection support, cleanup coordination, and sanitation-related assistance.', department: 'Environment and Sanitation Office', linkUrl: '', sortOrder: 5, paymentRequired: false, feeAmount: null, feeAssetCode: 'XLM' }
    ],
    hotlines: [
      { name: 'Emergency Response', description: 'Immediate emergency assistance and response coordination.', phone: '911', isEmergency: true, sortOrder: 1 },
      { name: 'Public Safety Office', description: 'Urgent public safety assistance and incident routing.', phone: '+63 2 8842 1400', isEmergency: true, sortOrder: 2 },
      { name: 'Citizen Services Desk', description: 'General service inquiries, request follow-ups, and office routing.', phone: '+63 2 8842 1100', isEmergency: false, sortOrder: 3 },
      { name: 'Public Works Hotline', description: 'Road, drainage, sidewalk, lighting, and facility maintenance concerns.', phone: '+63 2 8842 1200', isEmergency: false, sortOrder: 4 }
    ],
    news: [
      {
        title: 'Citizen service portal opens for online requests',
        excerpt: 'Residents can now submit concerns, receive reference numbers, and track city action online.',
        content:
          'The citizen service portal gives residents a single place to report local concerns, track progress, view services, and receive official updates from the operations team.'
      },
      {
        title: 'Request tracking improves service visibility',
        excerpt: 'Every submitted concern receives a reference number and a public update trail.',
        content:
          'The public tracker helps citizens see the current status, assigned department, public updates, and resolution progress without calling multiple offices.'
      }
    ],
    reports: [
      {
        referenceCode: 'MCS-2026-0001',
        category: 'Road and Sidewalk',
        department: 'Public Works Department',
        title: 'Pothole near school crossing',
        description: 'A pothole near the school crossing becomes difficult to see during rain and may affect pedestrians and tricycles.',
        locationText: 'Maharlika Avenue near the public school crossing',
        status: 'REVIEWING',
        priority: 'HIGH',
        updates: ['The report has been received and is under review by Public Works.']
      },
      {
        referenceCode: 'MCS-2026-0002',
        category: 'Public Safety',
        department: 'Public Safety Office',
        title: 'Damaged street barrier beside the school',
        description: 'A damaged barrier beside the school crossing needs replacement before dismissal hours.',
        locationText: 'Rizal Avenue school crossing',
        status: 'ASSIGNED',
        priority: 'URGENT',
        updates: ['The report was submitted successfully.', 'The report was assigned to Public Safety for action.']
      }
    ]
  },
  {
    slug: 'laguna-province',
    orgType: 'GOVERNMENT',
    name: 'Laguna Province Services',
    cityName: 'Laguna Province',
    tagline: 'Coordinated public services for provincial communities.',
    description:
      'A shared portal for provincial concerns, department routing, public contacts, announcements, and service updates across communities.',
    address: 'Provincial Government Center, Laguna, Philippines',
    email: 'citizen.services@lagunaprovince.gov.ph',
    phone: '+63 49 530 1000',
    primaryColor: '#2563eb',
    stellarReceivingPublicKey: null,
    admin: { name: 'Provincial Operations Administrator', email: 'admin@laguna.local' },
    citizen: { name: 'Ana Reyes', email: 'ana.reyes@laguna.local', phone: '+63 918 225 7741' },
    departments: [
      { name: 'Provincial Helpdesk', email: 'helpdesk@lagunaprovince.gov.ph', phone: '+63 49 530 1001' },
      { name: 'Engineering Coordination Office', email: 'engineering@lagunaprovince.gov.ph', phone: '+63 49 530 1002' },
      { name: 'Public Safety Coordination Desk', email: 'safety@lagunaprovince.gov.ph', phone: '+63 49 530 1003' }
    ],
    categories: [
      ['Road and Sidewalk', 'Road hazards, sidewalk issues, and provincial access concerns.'],
      ['Sanitation', 'Waste collection, cleanup, and sanitation concerns.'],
      ['Safety Concern', 'Public safety issues that need staff review.']
    ],
    services: [
      { title: 'Provincial Helpdesk Requests', description: 'Route general citizen concerns to the provincial helpdesk team for coordination.', department: 'Provincial Helpdesk', linkUrl: '', sortOrder: 1, paymentRequired: false, feeAmount: null, feeAssetCode: 'XLM' },
      { title: 'Engineering Coordination', description: 'Coordinate road, sidewalk, drainage, lighting, and public facility concerns.', department: 'Engineering Coordination Office', linkUrl: '', sortOrder: 2, paymentRequired: true, feeAmount: '10.0000000', feeAssetCode: 'XLM' },
      { title: 'Public Documents and Forms', description: 'Publish forms, advisories, and public information links for residents.', department: 'Provincial Helpdesk', linkUrl: '', sortOrder: 3, paymentRequired: true, feeAmount: '5.0000000', feeAssetCode: 'XLM' }
    ],
    hotlines: [
      { name: 'Emergency Response', description: 'Urgent emergency assistance and response coordination.', phone: '911', isEmergency: true, sortOrder: 1 },
      { name: 'Provincial Helpdesk', description: 'General service inquiries and request routing.', phone: '+63 49 530 1001', isEmergency: false, sortOrder: 2 }
    ],
    news: [
      {
        title: 'Provincial service portal expands public request tracking',
        excerpt: 'Residents can submit concerns and follow coordinated responses online.',
        content:
          'The provincial service portal supports concern routing, service discovery, announcement publishing, and request tracking across participating communities.'
      }
    ],
    reports: [
      {
        referenceCode: 'LPS-2026-0001',
        category: 'Road and Sidewalk',
        department: 'Engineering Coordination Office',
        title: 'Drainage cover needs replacement',
        description: 'A damaged drainage cover along the provincial road creates a safety risk for pedestrians and cyclists.',
        locationText: 'Provincial road beside the transport terminal',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        updates: ['The concern was routed to Engineering Coordination.', 'Field verification is scheduled with the maintenance team.']
      }
    ]
  },
  {
    slug: 'bayanihan-ngo',
    orgType: 'NGO',
    name: 'Bayanihan Community NGO',
    cityName: 'Bayanihan Network',
    tagline: 'Transparent aid, volunteer rewards, and community cleanup.',
    description:
      'A community NGO portal for medical fundraisers, direct aid disbursements, volunteer hour credentials, and environmental cleanup rewards — all with public Stellar proof.',
    address: 'Community Center, Quezon City, Philippines',
    email: 'hello@bayanihan-ngo.local',
    phone: '+63 917 555 0101',
    primaryColor: '#0f766e',
    stellarReceivingPublicKey: null,
    admin: { name: 'NGO Program Director', email: 'admin@bayanihan.local' },
    citizen: { name: 'Miguel Santos', email: 'miguel.santos@bayanihan.local', phone: '+63 917 555 0102' },
    departments: [
      { name: 'Volunteer Programs', email: 'volunteers@bayanihan.local', phone: '+63 917 555 0103' },
      { name: 'Community Aid Desk', email: 'aid@bayanihan.local', phone: '+63 917 555 0104' }
    ],
    categories: [
      ['Volunteer Support', 'Scheduling, credentials, and volunteer coordination.'],
      ['Community Aid', 'Emergency and medical assistance requests.'],
      ['Cleanup Drives', 'Environmental cleanup reporting and rewards.']
    ],
    services: [
      { title: 'Medical Relief Fund', description: 'Contribute to the community medical relief wallet with a verifiable public receipt.', department: 'Community Aid Desk', linkUrl: '', sortOrder: 1, serviceKind: 'CAMPAIGN', campaignGoalAmount: '500.0000000', paymentRequired: true, feeAmount: '5.0000000', feeAssetCode: 'XLM' },
      { title: 'General Donation', description: 'Support Bayanihan programs with a direct wallet donation and public proof.', department: 'Community Aid Desk', linkUrl: '', sortOrder: 2, serviceKind: 'DONATION', campaignGoalAmount: null, paymentRequired: true, feeAmount: '2.0000000', feeAssetCode: 'XLM' },
      { title: 'Volunteer Orientation', description: 'Register for volunteer orientation and receive activity credentials after verified service.', department: 'Volunteer Programs', linkUrl: '', sortOrder: 3, serviceKind: 'STANDARD', campaignGoalAmount: null, paymentRequired: false, feeAmount: null, feeAssetCode: 'XLM' }
    ],
    hotlines: [
      { name: 'Aid Coordination Hotline', description: 'Emergency community aid routing.', phone: '+63 917 555 0104', isEmergency: true, sortOrder: 1 },
      { name: 'Volunteer Desk', description: 'Volunteer scheduling and credentials.', phone: '+63 917 555 0103', isEmergency: false, sortOrder: 2 }
    ],
    news: [
      {
        title: 'Medical relief campaign opens public donations',
        excerpt: 'Every contribution receives a permanent Stellar receipt on the public ledger.',
        content: 'Donors can give from their own wallet and verify that funds reached the NGO receiving address without platform fees.'
      }
    ],
    reports: []
  },
  {
    slug: 'liga-sports',
    orgType: 'COMMUNITY',
    name: 'Liga Sports Club',
    cityName: 'Liga Sports',
    tagline: 'League dues, transparent prizes, and community sports programs.',
    description:
      'A community sports club portal for membership dues, tournament fees, and transparent prize disbursements with public ledger proof.',
    address: 'Municipal Sports Complex, Philippines',
    email: 'treasurer@liga-sports.local',
    phone: '+63 918 555 0201',
    primaryColor: '#b45309',
    stellarReceivingPublicKey: null,
    admin: { name: 'League Treasurer', email: 'admin@liga.local' },
    citizen: { name: 'Jessa Rivera', email: 'jessa.rivera@liga.local', phone: '+63 918 555 0202' },
    departments: [
      { name: 'League Operations', email: 'ops@liga.local', phone: '+63 918 555 0201' },
      { name: 'Tournament Desk', email: 'tourney@liga.local', phone: '+63 918 555 0203' }
    ],
    categories: [
      ['Facilities', 'Court bookings and facility concerns.'],
      ['Tournament', 'Schedule, fees, and prize inquiries.']
    ],
    services: [
      { title: 'Season Membership Dues', description: 'Pay league membership with a wallet-signed receipt for the treasurer.', department: 'League Operations', linkUrl: '', sortOrder: 1, serviceKind: 'MEMBERSHIP', campaignGoalAmount: null, paymentRequired: true, feeAmount: '10.0000000', feeAssetCode: 'XLM' },
      { title: 'Tournament Registration', description: 'Register a team and pay entry fees with public proof.', department: 'Tournament Desk', linkUrl: '', sortOrder: 2, serviceKind: 'STANDARD', campaignGoalAmount: null, paymentRequired: true, feeAmount: '15.0000000', feeAssetCode: 'XLM' },
      { title: 'Championship Prize Pool', description: 'Transparent community contributions toward the championship prize fund.', department: 'Tournament Desk', linkUrl: '', sortOrder: 3, serviceKind: 'CAMPAIGN', campaignGoalAmount: '200.0000000', paymentRequired: true, feeAmount: '3.0000000', feeAssetCode: 'XLM' }
    ],
    hotlines: [
      { name: 'Tournament Desk', description: 'Game schedules and registration support.', phone: '+63 918 555 0203', isEmergency: false, sortOrder: 1 }
    ],
    news: [
      {
        title: 'Prize pool contributions now tracked on the public ledger',
        excerpt: 'Members can verify every dues payment and prize disbursement.',
        content: 'The league treasurer publishes disbursements with on-chain proof so teams can trust prize payouts.'
      }
    ],
    reports: []
  },
  {
    slug: 'freelancer-guild',
    orgType: 'BUSINESS',
    name: 'Freelancer Guild',
    cityName: 'Freelancer Guild',
    tagline: 'Portable payment proof for independent professionals.',
    description:
      'A freelancer collective portal where clients pay via Stellar and members export verifiable income certificates from the public ledger.',
    address: 'Remote-first collective, Philippines',
    email: 'billing@freelancer-guild.local',
    phone: '+63 919 555 0301',
    primaryColor: '#4338ca',
    stellarReceivingPublicKey: null,
    admin: { name: 'Guild Billing Admin', email: 'admin@freelancer.local' },
    citizen: { name: 'Paolo Mendoza', email: 'paolo.mendoza@freelancer.local', phone: '+63 919 555 0302' },
    departments: [
      { name: 'Client Billing', email: 'billing@freelancer-guild.local', phone: '+63 919 555 0301' }
    ],
    categories: [
      ['Billing Support', 'Invoice and payment receipt questions.'],
      ['Member Services', 'Guild membership and credentials.']
    ],
    services: [
      { title: 'Client Project Invoice', description: 'Clients pay a guild invoice with a permanent public receipt suitable for income verification.', department: 'Client Billing', linkUrl: '', sortOrder: 1, serviceKind: 'STANDARD', campaignGoalAmount: null, paymentRequired: true, feeAmount: '20.0000000', feeAssetCode: 'XLM' },
      { title: 'Guild Membership', description: 'Annual freelancer guild membership with verifiable payment proof.', department: 'Member Services', linkUrl: '', sortOrder: 2, serviceKind: 'MEMBERSHIP', campaignGoalAmount: null, paymentRequired: true, feeAmount: '8.0000000', feeAssetCode: 'XLM' },
      { title: 'Workshop Pass', description: 'Pay for guild workshops and training sessions.', department: 'Member Services', linkUrl: '', sortOrder: 3, serviceKind: 'STANDARD', campaignGoalAmount: null, paymentRequired: true, feeAmount: '5.0000000', feeAssetCode: 'XLM' }
    ],
    hotlines: [
      { name: 'Billing Desk', description: 'Client payment and receipt support.', phone: '+63 919 555 0301', isEmergency: false, sortOrder: 1 }
    ],
    news: [
      {
        title: 'Income certificates now available from verified payments',
        excerpt: 'Members can export wallet-verified payment history for loan or client applications.',
        content: 'Every verified client payment on the public ledger can be exported as a portable income certificate.'
      }
    ],
    reports: []
  }
] as const;

async function main() {
  const passwordHash = await bcrypt.hash('admin12345', 10);
  const citizenPasswordHash = await bcrypt.hash('citizen12345', 10);

  // Platform (root) administrator that manages all tenants at /root.
  const platformPasswordHash = await bcrypt.hash('root12345', 10);
  await prisma.platformAdmin.upsert({
    where: { email: 'root@civictrust.local' },
    update: { name: 'Platform Root Admin', isActive: true },
    create: { name: 'Platform Root Admin', email: 'root@civictrust.local', passwordHash: platformPasswordHash, isActive: true }
  });

  for (const setting of runtimeSettings) {
    await prisma.runtimeSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isSecret: false
      },
      create: {
        ...setting,
        isSecret: false
      }
    });
  }

  await prisma.tenant.deleteMany({
    where: {
      slug: {
        notIn: tenantConfigs.map((tenant) => tenant.slug)
      }
    }
  });

  for (const config of tenantConfigs) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: config.slug },
      update: {
        name: config.name,
        orgType: (config as any).orgType || 'GOVERNMENT',
        cityName: config.cityName,
        tagline: config.tagline,
        description: config.description,
        address: config.address,
        email: config.email,
        phone: config.phone,
        primaryColor: config.primaryColor,
        isActive: true
      },
      create: {
        slug: config.slug,
        name: config.name,
        orgType: (config as any).orgType || 'GOVERNMENT',
        cityName: config.cityName,
        tagline: config.tagline,
        description: config.description,
        address: config.address,
        email: config.email,
        phone: config.phone,
        primaryColor: config.primaryColor,
        stellarReceivingPublicKey: config.stellarReceivingPublicKey,
        stellarReceivingSecretEncrypted: null,
        stellarNetwork: 'TESTNET',
        stellarNetworkPassphrase: 'Test SDF Network ; September 2015',
        stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
        stellarFriendbotUrl: 'https://friendbot.stellar.org',
        stellarDefaultAssetCode: 'XLM',
        stellarDefaultAssetIssuer: null,
        stellarWalletStatus: 'NOT_CONFIGURED',
        stellarWalletError: null,
        isActive: true
      }
    });

    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: config.admin.email } },
      update: { name: config.admin.name, passwordHash, role: 'ADMIN', isActive: true },
      create: { tenantId: tenant.id, name: config.admin.name, email: config.admin.email, passwordHash, role: 'ADMIN', isActive: true }
    });

    const citizen = await prisma.citizen.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: config.citizen.email } },
      update: { name: config.citizen.name, phone: config.citizen.phone, passwordHash: citizenPasswordHash, isActive: true },
      create: { tenantId: tenant.id, name: config.citizen.name, email: config.citizen.email, phone: config.citizen.phone, passwordHash: citizenPasswordHash, isActive: true }
    });

    for (const department of config.departments) {
      await prisma.department.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: department.name } },
        update: { ...department, isActive: true },
        create: { tenantId: tenant.id, ...department, isActive: true }
      });
    }

    for (const [name, description] of config.categories) {
      await prisma.reportCategory.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name } },
        update: { description, isActive: true },
        create: { tenantId: tenant.id, name, description, isActive: true }
      });
    }

    await prisma.paymentIntent.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.service.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.hotline.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.newsPost.deleteMany({ where: { tenantId: tenant.id } });

    await prisma.service.createMany({
      data: config.services.map((service) => ({
        tenantId: tenant.id,
        ...service,
        isActive: true,
        feeAssetIssuer: null,
        receivingPublicKey: null,
        serviceKind: (service as any).serviceKind || 'STANDARD',
        campaignGoalAmount: (service as any).campaignGoalAmount || null
      }))
    });

    await prisma.hotline.createMany({
      data: config.hotlines.map((hotline) => ({ tenantId: tenant.id, ...hotline, isActive: true }))
    });

    await prisma.newsPost.createMany({
      data: config.news.map((post) => ({ tenantId: tenant.id, ...post, publishedAt: new Date(), isPublished: true }))
    });

    await prisma.civicAction.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.transparencyEntry.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.propertyTaxReceipt.deleteMany({ where: { tenantId: tenant.id } });

    await prisma.civicAction.createMany({
      data: [
        {
          tenantId: tenant.id,
          citizenId: citizen.id,
          type: config.slug === 'bayanihan-ngo' ? 'VOLUNTEER' : 'PARTICIPATION',
          title: config.slug === 'bayanihan-ngo' ? 'Food drive volunteer shift' : 'Public consultation attendance',
          description:
            config.slug === 'bayanihan-ngo'
              ? 'Volunteer completed a four-hour food packing shift with photo evidence attached.'
              : 'Resident attended a public consultation and submitted feedback for service improvements.',
          locationText: `${config.cityName} Civic Hall`,
          participantName: citizen.name,
          participantEmail: citizen.email,
          participantPhone: citizen.phone,
          rewardAmount: config.slug === 'bayanihan-ngo' ? '1.5000000' : '1.0000000',
          rewardAssetCode: 'XLM',
          rewardMemo: `${config.slug.slice(0, 3).toUpperCase()}-ACT-0001`,
          status: 'APPROVED',
          verificationNote: 'Attendance was confirmed by staff sign-in sheet.'
        },
        {
          tenantId: tenant.id,
          citizenId: citizen.id,
          type: 'CLEANUP',
          title: 'Community cleanup documentation',
          description: 'Cleanup evidence submitted for staff review before reward payout.',
          locationText: `${config.cityName} riverside walkway`,
          participantName: citizen.name,
          participantEmail: citizen.email,
          participantPhone: citizen.phone,
          rewardAmount: '2.0000000',
          rewardAssetCode: 'XLM',
          rewardMemo: `${config.slug.slice(0, 3).toUpperCase()}-CLN-0001`,
          status: 'REVIEWING',
          verificationNote: 'Pending photo and location verification.'
        }
      ]
    });

    await prisma.transparencyEntry.createMany({
      data: [
        {
          tenantId: tenant.id,
          referenceCode: `${config.slug.slice(0, 3).toUpperCase()}-LED-0001`,
          entryType: 'BUDGET_ALLOCATION',
          status: 'PUBLISHED',
          title: 'Road maintenance allocation',
          description: 'Published allocation for road patching, drainage clearing, and safety markings.',
          department: config.departments[1]?.name || 'Operations',
          recipientName: 'Public Works Program',
          amount: '100.0000000',
          assetCode: 'XLM',
          memo: `${config.slug.slice(0, 3).toUpperCase()}-LED-0001`,
          occurredAt: new Date()
        },
        {
          tenantId: tenant.id,
          referenceCode: `${config.slug.slice(0, 3).toUpperCase()}-LED-0002`,
          entryType: config.slug === 'bayanihan-ngo' ? 'MEDICAL_AID' : config.slug === 'liga-sports' ? 'PRIZE_PAYOUT' : 'GRANT',
          status: 'PUBLISHED',
          title:
            config.slug === 'bayanihan-ngo'
              ? 'Emergency medical aid disbursement'
              : config.slug === 'liga-sports'
                ? 'Tournament prize reserve'
                : 'Community cleanup incentive pool',
          description:
            config.slug === 'bayanihan-ngo'
              ? 'Published medical aid release for a verified community beneficiary.'
              : config.slug === 'liga-sports'
                ? 'Prize pool reserved for championship winners with public disbursement proof.'
                : 'Reward pool reserved for verified cleanup actions and environmental participation.',
          department: config.departments[1]?.name || config.departments[0]?.name || 'Operations',
          recipientName: config.slug === 'bayanihan-ngo' ? 'Aid Beneficiary' : config.slug === 'liga-sports' ? 'Championship Teams' : 'Civic Rewards Program',
          amount: '50.0000000',
          assetCode: 'XLM',
          memo: `${config.slug.slice(0, 3).toUpperCase()}-LED-0002`,
          occurredAt: new Date()
        }
      ]
    });

    await prisma.propertyTaxReceipt.createMany({
      data: [
        {
          tenantId: tenant.id,
          citizenId: citizen.id,
          referenceCode: `${config.slug.slice(0, 3).toUpperCase()}-TAX-0001`,
          taxpayerName: citizen.name,
          taxpayerEmail: citizen.email,
          propertyIndexNumber: `${config.slug.slice(0, 3).toUpperCase()}-PIN-2026-001`,
          propertyAddress: `Block 12 Lot 8 Civic Heights, ${config.cityName}`,
          taxYear: 2026,
          amount: '15.0000000',
          assetCode: 'XLM',
          status: 'ISSUED',
          issuedAt: new Date()
        }
      ]
    });

    for (const reportConfig of config.reports) {
      const category = await prisma.reportCategory.findFirstOrThrow({ where: { tenantId: tenant.id, name: reportConfig.category } });
      const department = await prisma.department.findFirstOrThrow({ where: { tenantId: tenant.id, name: reportConfig.department } });
      const existingReport = await prisma.report.findFirst({ where: { tenantId: tenant.id, referenceCode: reportConfig.referenceCode } });

      if (!existingReport) {
        const report = await prisma.report.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            departmentId: department.id,
            citizenId: citizen.id,
            referenceCode: reportConfig.referenceCode,
            reporterName: citizen.name,
            reporterEmail: citizen.email,
            reporterPhone: citizen.phone,
            title: reportConfig.title,
            description: reportConfig.description,
            locationText: reportConfig.locationText,
            status: reportConfig.status,
            priority: reportConfig.priority
          }
        });

        await prisma.reportUpdate.createMany({
          data: reportConfig.updates.map((message) => ({
            reportId: report.id,
            status: reportConfig.status,
            message,
            isPublic: true
          }))
        });
      } else {
        await prisma.report.update({
          where: { id: existingReport.id },
          data: {
            citizenId: citizen.id,
            categoryId: category.id,
            departmentId: department.id,
            reporterName: citizen.name,
            reporterEmail: citizen.email,
            reporterPhone: citizen.phone,
            title: reportConfig.title,
            description: reportConfig.description,
            locationText: reportConfig.locationText,
            status: reportConfig.status,
            priority: reportConfig.priority
          }
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

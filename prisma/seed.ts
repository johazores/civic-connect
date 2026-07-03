import bcrypt from 'bcryptjs';

const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => any };

const prisma = new PrismaClient();

const tenantConfigs = [
  {
    slug: 'metro-city',
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
  }
] as const;

async function main() {
  const passwordHash = await bcrypt.hash('admin12345', 10);
  const citizenPasswordHash = await bcrypt.hash('citizen12345', 10);

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
      data: config.services.map((service) => ({ tenantId: tenant.id, ...service, isActive: true, feeAssetIssuer: null, receivingPublicKey: null }))
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
          type: 'PARTICIPATION',
          title: 'Public consultation attendance',
          description: 'Resident attended a public consultation and submitted feedback for service improvements.',
          locationText: `${config.cityName} Civic Hall`,
          participantName: citizen.name,
          participantEmail: citizen.email,
          participantPhone: citizen.phone,
          rewardAmount: '1.0000000',
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
          entryType: 'GRANT',
          status: 'PUBLISHED',
          title: 'Community cleanup incentive pool',
          description: 'Reward pool reserved for verified cleanup actions and environmental participation.',
          department: config.departments[2]?.name || 'Environment Office',
          recipientName: 'Civic Rewards Program',
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

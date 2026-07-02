import bcrypt from 'bcryptjs';

// Keep the seed file type-safe before Prisma Client generation.
const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => any };

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin12345', 10);
  const citizenPasswordHash = await bcrypt.hash('citizen12345', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'san-pablo' },
    update: {
      name: 'San Pablo Connect',
      cityName: 'San Pablo City',
      tagline: 'Your city services in one simple platform.',
      description:
        'Report local issues, track city requests, view services, read announcements, and access important hotlines.',
      address: 'San Pablo City, Laguna, Philippines',
      email: 'info@sanpablo.local',
      phone: '+63 49 000 0000',
      primaryColor: '#2563eb',
      isActive: true
    },
    create: {
      slug: 'san-pablo',
      name: 'San Pablo Connect',
      cityName: 'San Pablo City',
      tagline: 'Your city services in one simple platform.',
      description:
        'Report local issues, track city requests, view services, read announcements, and access important hotlines.',
      address: 'San Pablo City, Laguna, Philippines',
      email: 'info@sanpablo.local',
      phone: '+63 49 000 0000',
      primaryColor: '#2563eb'
    }
  });

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@sanpablo.local'
      }
    },
    update: {
      name: 'City Admin',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      name: 'City Admin',
      email: 'admin@sanpablo.local',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    }
  });

  const sanPabloCitizen = await prisma.citizen.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'citizen@sanpablo.local'
      }
    },
    update: { name: 'Demo Citizen', phone: '+63 900 000 0000', passwordHash: citizenPasswordHash, isActive: true },
    create: {
      tenantId: tenant.id,
      name: 'Demo Citizen',
      email: 'citizen@sanpablo.local',
      phone: '+63 900 000 0000',
      passwordHash: citizenPasswordHash
    }
  });

  const departments = [
    { name: 'City Administrator', email: 'admin@sanpablo.local', phone: '+63 49 000 0002' },
    { name: 'Public Works', email: 'publicworks@sanpablo.local', phone: '+63 49 000 0003' },
    { name: 'Waste Management', email: 'waste@sanpablo.local', phone: '+63 49 000 0004' },
    { name: 'Public Safety', email: 'safety@sanpablo.local', phone: '+63 49 000 0001' },
    { name: 'Business Permits', email: 'permits@sanpablo.local', phone: '+63 49 000 0005' }
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: department.name } },
      update: { ...department, isActive: true },
      create: { tenantId: tenant.id, ...department, isActive: true }
    });
  }

  const categories = [
    ['Road Concern', 'Potholes, road hazards, blocked roads, and damaged signs.'],
    ['Garbage Concern', 'Collection issues, illegal dumping, and waste concerns.'],
    ['Streetlight Concern', 'Broken, unsafe, or inactive public lighting.'],
    ['Drainage Concern', 'Flooding, blocked drainage, and canal concerns.'],
    ['Public Safety', 'Safety hazards and concerns that need city attention.']
  ];

  for (const [name, description] of categories) {
    await prisma.reportCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: { description, isActive: true },
      create: { tenantId: tenant.id, name, description, isActive: true }
    });
  }

  await prisma.service.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.hotline.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.newsPost.deleteMany({ where: { tenantId: tenant.id } });

  await prisma.service.createMany({
    data: [
      {
        tenantId: tenant.id,
        title: 'Business Permit Assistance',
        description: 'View requirements and submit concerns related to business permits and renewals.',
        department: 'Business Permits',
        sortOrder: 1
      },
      {
        tenantId: tenant.id,
        title: 'Real Property Information',
        description: 'Access basic information and guidance for real property tax-related services.',
        department: 'City Treasurer',
        sortOrder: 2
      },
      {
        tenantId: tenant.id,
        title: 'Citizen Forms and Requests',
        description: 'Find common city forms, citizen requests, and local government requirements.',
        department: 'City Administrator',
        sortOrder: 3
      },
      {
        tenantId: tenant.id,
        title: 'Public Works Requests',
        description: 'Submit concerns related to roads, drainage, public spaces, and maintenance.',
        department: 'Public Works',
        sortOrder: 4
      }
    ]
  });

  await prisma.hotline.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Emergency Response',
        description: 'For urgent emergency assistance.',
        phone: '911',
        isEmergency: true,
        sortOrder: 1
      },
      {
        tenantId: tenant.id,
        name: 'Public Safety Office',
        description: 'City public safety and incident support.',
        phone: '+63 49 000 0001',
        isEmergency: true,
        sortOrder: 2
      },
      {
        tenantId: tenant.id,
        name: 'City Information Desk',
        description: 'General inquiries and service guidance.',
        phone: '+63 49 000 0002',
        sortOrder: 3
      }
    ]
  });

  await prisma.newsPost.createMany({
    data: [
      {
        tenantId: tenant.id,
        title: 'Welcome to San Pablo Connect',
        excerpt: 'A simple way for citizens to reach city services and track requests.',
        content:
          'San Pablo Connect helps citizens submit reports, view services, track requests, and access important city information in one place.',
        publishedAt: new Date()
      },
      {
        tenantId: tenant.id,
        title: 'Report local concerns online',
        excerpt: 'Citizens can now submit concerns and receive a tracking reference number.',
        content:
          'Use the report form to submit road, garbage, streetlight, drainage, and public safety concerns. Each report receives a reference number for tracking.',
        publishedAt: new Date()
      }
    ]
  });

  const roadCategory = await prisma.reportCategory.findFirstOrThrow({
    where: { tenantId: tenant.id, name: 'Road Concern' }
  });

  const existingReport = await prisma.report.findFirst({
    where: { tenantId: tenant.id, referenceCode: 'SPC-2026-0001' }
  });

  if (!existingReport) {
    const report = await prisma.report.create({
      data: {
        tenantId: tenant.id,
        categoryId: roadCategory.id,
        referenceCode: 'SPC-2026-0001',
        citizenId: sanPabloCitizen.id,
        reporterName: 'Demo Citizen',
        reporterEmail: 'citizen@sanpablo.local',
        reporterPhone: '+63 900 000 0000',
        title: 'Pothole near city road',
        description: 'There is a pothole near the corner that may cause accidents during rainy days.',
        locationText: 'Near city center road',
        status: 'REVIEWING',
        priority: 'HIGH',
        departmentId: (await prisma.department.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Public Works' } })).id
      }
    });

    await prisma.reportUpdate.create({
      data: {
        reportId: report.id,
        status: 'REVIEWING',
        message: 'The report has been received and is now under review.',
        isPublic: true
      }
    });
  } else if (!existingReport.citizenId) {
    await prisma.report.update({ where: { id: existingReport.id }, data: { citizenId: sanPabloCitizen.id } });
  }


  const safetyCategory = await prisma.reportCategory.findFirstOrThrow({
    where: { tenantId: tenant.id, name: 'Public Safety' }
  });

  const existingSafetyReport = await prisma.report.findFirst({
    where: { tenantId: tenant.id, referenceCode: 'SPC-2026-0002' }
  });

  if (!existingSafetyReport) {
    const publicSafety = await prisma.department.findFirstOrThrow({
      where: { tenantId: tenant.id, name: 'Public Safety' }
    });

    const report = await prisma.report.create({
      data: {
        tenantId: tenant.id,
        categoryId: safetyCategory.id,
        departmentId: publicSafety.id,
        referenceCode: 'SPC-2026-0002',
        citizenId: sanPabloCitizen.id,
        reporterName: 'Maria Citizen',
        reporterEmail: 'citizen@sanpablo.local',
        reporterPhone: '+63 911 000 0000',
        title: 'Broken street barrier near school',
        description: 'A road barrier near the school crossing is damaged and could be unsafe for students.',
        locationText: 'Near public school crossing',
        status: 'ASSIGNED',
        priority: 'URGENT'
      }
    });

    await prisma.reportUpdate.createMany({
      data: [
        {
          reportId: report.id,
          status: 'SUBMITTED',
          message: 'The report was submitted successfully.',
          isPublic: true
        },
        {
          reportId: report.id,
          status: 'ASSIGNED',
          message: 'The report was assigned to Public Safety for action.',
          isPublic: true
        }
      ]
    });
  } else if (!existingSafetyReport.citizenId) {
    await prisma.report.update({ where: { id: existingSafetyReport.id }, data: { citizenId: sanPabloCitizen.id } });
  }


  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-city' },
    update: {
      name: 'Demo City Connect',
      cityName: 'Demo City',
      tagline: 'A second tenant to prove data isolation.',
      description:
        'This sample tenant uses the same application with separate users, services, hotlines, news, categories, and reports.',
      address: 'Demo City, Philippines',
      email: 'info@demo-city.local',
      phone: '+63 2 000 0000',
      primaryColor: '#4f46e5',
      isActive: true
    },
    create: {
      slug: 'demo-city',
      name: 'Demo City Connect',
      cityName: 'Demo City',
      tagline: 'A second tenant to prove data isolation.',
      description:
        'This sample tenant uses the same application with separate users, services, hotlines, news, categories, and reports.',
      address: 'Demo City, Philippines',
      email: 'info@demo-city.local',
      phone: '+63 2 000 0000',
      primaryColor: '#4f46e5'
    }
  });

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'admin@demo-city.local'
      }
    },
    update: {
      name: 'Demo City Admin',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      tenantId: demoTenant.id,
      name: 'Demo City Admin',
      email: 'admin@demo-city.local',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    }
  });

  const demoCitizen = await prisma.citizen.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'citizen@demo-city.local'
      }
    },
    update: { name: 'Demo City Citizen', phone: '+63 900 100 0000', passwordHash: citizenPasswordHash, isActive: true },
    create: {
      tenantId: demoTenant.id,
      name: 'Demo City Citizen',
      email: 'citizen@demo-city.local',
      phone: '+63 900 100 0000',
      passwordHash: citizenPasswordHash
    }
  });

  const demoDepartments = [
    { name: 'City Helpdesk', email: 'helpdesk@demo-city.local', phone: '+63 2 000 1000' },
    { name: 'Engineering Office', email: 'engineering@demo-city.local', phone: '+63 2 000 2000' },
    { name: 'Public Safety Desk', email: 'safety@demo-city.local', phone: '+63 2 000 3000' }
  ];

  for (const department of demoDepartments) {
    await prisma.department.upsert({
      where: { tenantId_name: { tenantId: demoTenant.id, name: department.name } },
      update: { ...department, isActive: true },
      create: { tenantId: demoTenant.id, ...department, isActive: true }
    });
  }

  const demoCategories = [
    ['Road and Sidewalk', 'Road hazards, sidewalk issues, and public path concerns.'],
    ['Sanitation', 'Waste collection, cleanup, and sanitation concerns.'],
    ['Safety Concern', 'Public safety issues that need staff review.']
  ];

  for (const [name, description] of demoCategories) {
    await prisma.reportCategory.upsert({
      where: { tenantId_name: { tenantId: demoTenant.id, name } },
      update: { description, isActive: true },
      create: { tenantId: demoTenant.id, name, description, isActive: true }
    });
  }

  await prisma.service.deleteMany({ where: { tenantId: demoTenant.id } });
  await prisma.hotline.deleteMany({ where: { tenantId: demoTenant.id } });
  await prisma.newsPost.deleteMany({ where: { tenantId: demoTenant.id } });

  await prisma.service.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        title: 'City Helpdesk Requests',
        description: 'General citizen concerns routed to the city helpdesk team.',
        department: 'City Helpdesk',
        sortOrder: 1
      },
      {
        tenantId: demoTenant.id,
        title: 'Engineering Concerns',
        description: 'Roads, sidewalks, lights, drainage, and facilities concerns.',
        department: 'Engineering Office',
        sortOrder: 2
      },
      {
        tenantId: demoTenant.id,
        title: 'Transparency and Forms',
        description: 'A configurable service card for public forms, publications, and transparency links.',
        department: 'City Helpdesk',
        sortOrder: 3
      }
    ]
  });

  await prisma.hotline.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        name: 'Demo Emergency',
        description: 'Sample emergency contact for this tenant.',
        phone: '911',
        isEmergency: true,
        sortOrder: 1
      },
      {
        tenantId: demoTenant.id,
        name: 'Demo Helpdesk',
        description: 'Sample general inquiry line.',
        phone: '+63 2 000 1000',
        sortOrder: 2
      }
    ]
  });

  await prisma.newsPost.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        title: 'Demo City tenant is live',
        excerpt: 'This second tenant proves that content and reports are scoped per city.',
        content:
          'Demo City uses the same Civic Connect codebase but keeps its own users, public content, and reports isolated from San Pablo Connect.',
        publishedAt: new Date()
      }
    ]
  });


  const demoRoadCategory = await prisma.reportCategory.findFirstOrThrow({
    where: { tenantId: demoTenant.id, name: 'Road and Sidewalk' }
  });
  const demoEngineering = await prisma.department.findFirstOrThrow({
    where: { tenantId: demoTenant.id, name: 'Engineering Office' }
  });
  const existingDemoReport = await prisma.report.findFirst({
    where: { tenantId: demoTenant.id, referenceCode: 'DC-2026-0001' }
  });

  if (!existingDemoReport) {
    const report = await prisma.report.create({
      data: {
        tenantId: demoTenant.id,
        categoryId: demoRoadCategory.id,
        departmentId: demoEngineering.id,
        citizenId: demoCitizen.id,
        referenceCode: 'DC-2026-0001',
        reporterName: 'Demo City Citizen',
        reporterEmail: 'citizen@demo-city.local',
        reporterPhone: '+63 900 100 0000',
        title: 'Sample sidewalk repair request',
        description: 'A sample tenant-scoped request to prove citizen dashboard isolation.',
        locationText: 'Demo City central sidewalk',
        status: 'IN_PROGRESS',
        priority: 'NORMAL'
      }
    });

    await prisma.reportUpdate.createMany({
      data: [
        {
          reportId: report.id,
          status: 'SUBMITTED',
          message: 'The sample report was submitted by the demo citizen.',
          isPublic: true
        },
        {
          reportId: report.id,
          status: 'IN_PROGRESS',
          message: 'The engineering team started reviewing the repair request.',
          isPublic: true
        }
      ]
    });
  } else if (!existingDemoReport.citizenId) {
    await prisma.report.update({ where: { id: existingDemoReport.id }, data: { citizenId: demoCitizen.id } });
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

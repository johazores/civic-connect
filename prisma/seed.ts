import bcrypt from 'bcryptjs';

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
      tagline: 'City services, requests, and updates in one trusted portal.',
      description:
        'Report local concerns, track service requests, browse public services, read announcements, and access important contacts from one modern platform.',
      address: 'San Pablo City, Laguna, Philippines',
      email: 'citizen.services@sanpablo.local',
      phone: '+63 49 562 0000',
      primaryColor: '#1f6feb',
      isActive: true
    },
    create: {
      slug: 'san-pablo',
      name: 'San Pablo Connect',
      cityName: 'San Pablo City',
      tagline: 'City services, requests, and updates in one trusted portal.',
      description:
        'Report local concerns, track service requests, browse public services, read announcements, and access important contacts from one modern platform.',
      address: 'San Pablo City, Laguna, Philippines',
      email: 'citizen.services@sanpablo.local',
      phone: '+63 49 562 0000',
      primaryColor: '#1f6feb'
    }
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@sanpablo.local' } },
    update: { name: 'City Operations Admin', passwordHash, role: 'ADMIN', isActive: true },
    create: { tenantId: tenant.id, name: 'City Operations Admin', email: 'admin@sanpablo.local', passwordHash, role: 'ADMIN', isActive: true }
  });

  const sanPabloCitizen = await prisma.citizen.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'maria.santos@sanpablo.local' } },
    update: { name: 'Maria Santos', phone: '+63 917 482 1934', passwordHash: citizenPasswordHash, isActive: true },
    create: { tenantId: tenant.id, name: 'Maria Santos', email: 'maria.santos@sanpablo.local', phone: '+63 917 482 1934', passwordHash: citizenPasswordHash }
  });

  const departments = [
    { name: 'City Administrator Office', email: 'administrator@sanpablo.local', phone: '+63 49 562 0101' },
    { name: 'Public Works Office', email: 'publicworks@sanpablo.local', phone: '+63 49 562 0102' },
    { name: 'Environment and Sanitation Office', email: 'sanitation@sanpablo.local', phone: '+63 49 562 0103' },
    { name: 'Public Safety Office', email: 'safety@sanpablo.local', phone: '+63 49 562 0104' },
    { name: 'Business Permits Office', email: 'permits@sanpablo.local', phone: '+63 49 562 0105' }
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: department.name } },
      update: { ...department, isActive: true },
      create: { tenantId: tenant.id, ...department, isActive: true }
    });
  }

  const categories = [
    ['Road and Sidewalk', 'Potholes, blocked roads, damaged signs, unsafe walkways, and public path concerns.'],
    ['Waste and Sanitation', 'Missed collection, illegal dumping, cleanup requests, and waste-related concerns.'],
    ['Streetlight and Utilities', 'Broken public lighting, exposed wiring, and visible utility hazards.'],
    ['Drainage and Flooding', 'Blocked drainage, canals, flooding, and standing water concerns.'],
    ['Public Safety', 'Hazards or incidents that need public safety review.']
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
      { tenantId: tenant.id, title: 'Business Permit Assistance', description: 'Review requirements and request help for business permit applications, renewals, and follow-ups.', department: 'Business Permits Office', sortOrder: 1 },
      { tenantId: tenant.id, title: 'Real Property Guidance', description: 'Find guidance for real property records, tax-related inquiries, and assessment assistance.', department: 'City Treasurer', sortOrder: 2 },
      { tenantId: tenant.id, title: 'Citizen Forms and Requests', description: 'Access common city request types, public forms, and service guidance from the city administrator office.', department: 'City Administrator Office', sortOrder: 3 },
      { tenantId: tenant.id, title: 'Public Works Requests', description: 'Send concerns related to road maintenance, drainage, public spaces, sidewalks, and city facilities.', department: 'Public Works Office', sortOrder: 4 },
      { tenantId: tenant.id, title: 'Environment and Sanitation', description: 'Report sanitation concerns, cleanup requests, and waste collection issues for department action.', department: 'Environment and Sanitation Office', sortOrder: 5 }
    ]
  });

  await prisma.hotline.createMany({
    data: [
      { tenantId: tenant.id, name: 'Emergency Response', description: 'For urgent emergency assistance and immediate response coordination.', phone: '911', isEmergency: true, sortOrder: 1 },
      { tenantId: tenant.id, name: 'Public Safety Office', description: 'City public safety desk for incident support and urgent local concerns.', phone: '+63 49 562 0104', isEmergency: true, sortOrder: 2 },
      { tenantId: tenant.id, name: 'Citizen Services Desk', description: 'General service inquiries, routing support, and request follow-ups.', phone: '+63 49 562 0100', sortOrder: 3 },
      { tenantId: tenant.id, name: 'Public Works Hotline', description: 'Road, drainage, sidewalk, and facility maintenance concerns.', phone: '+63 49 562 0102', sortOrder: 4 }
    ]
  });

  await prisma.newsPost.createMany({
    data: [
      { tenantId: tenant.id, title: 'Citizen service portal now available', excerpt: 'Residents can submit concerns, receive reference numbers, and track city action online.', content: 'San Pablo Connect gives residents a single place to submit local concerns, track progress, view public services, and receive updates from the city team.', publishedAt: new Date() },
      { tenantId: tenant.id, title: 'Online tracking improves request visibility', excerpt: 'Every submitted concern receives a reference number and public update trail.', content: 'The request tracker helps citizens see the current status, assigned department, public updates, and resolution progress without calling multiple offices.', publishedAt: new Date() }
    ]
  });

  const roadCategory = await prisma.reportCategory.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Road and Sidewalk' } });
  const safetyCategory = await prisma.reportCategory.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Public Safety' } });
  const publicWorks = await prisma.department.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Public Works Office' } });
  const publicSafety = await prisma.department.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Public Safety Office' } });

  const existingReport = await prisma.report.findFirst({ where: { tenantId: tenant.id, referenceCode: 'SPC-2026-0001' } });
  if (!existingReport) {
    const report = await prisma.report.create({
      data: {
        tenantId: tenant.id,
        categoryId: roadCategory.id,
        referenceCode: 'SPC-2026-0001',
        citizenId: sanPabloCitizen.id,
        reporterName: 'Maria Santos',
        reporterEmail: 'maria.santos@sanpablo.local',
        reporterPhone: '+63 917 482 1934',
        title: 'Pothole near school crossing',
        description: 'A pothole near the school crossing becomes difficult to see during rain and may affect pedestrians and tricycles.',
        locationText: 'Maharlika Highway near the public school crossing',
        status: 'REVIEWING',
        priority: 'HIGH',
        departmentId: publicWorks.id
      }
    });
    await prisma.reportUpdate.create({ data: { reportId: report.id, status: 'REVIEWING', message: 'The report has been received and is under review by Public Works.', isPublic: true } });
  } else if (!existingReport.citizenId) {
    await prisma.report.update({ where: { id: existingReport.id }, data: { citizenId: sanPabloCitizen.id } });
  }

  const existingSafetyReport = await prisma.report.findFirst({ where: { tenantId: tenant.id, referenceCode: 'SPC-2026-0002' } });
  if (!existingSafetyReport) {
    const report = await prisma.report.create({
      data: {
        tenantId: tenant.id,
        categoryId: safetyCategory.id,
        departmentId: publicSafety.id,
        referenceCode: 'SPC-2026-0002',
        citizenId: sanPabloCitizen.id,
        reporterName: 'Maria Santos',
        reporterEmail: 'maria.santos@sanpablo.local',
        reporterPhone: '+63 917 482 1934',
        title: 'Damaged street barrier beside the school',
        description: 'A damaged barrier beside the school crossing needs replacement before dismissal hours.',
        locationText: 'Rizal Avenue school crossing',
        status: 'ASSIGNED',
        priority: 'URGENT'
      }
    });
    await prisma.reportUpdate.createMany({ data: [
      { reportId: report.id, status: 'SUBMITTED', message: 'The report was submitted successfully.', isPublic: true },
      { reportId: report.id, status: 'ASSIGNED', message: 'The report was assigned to Public Safety for action.', isPublic: true }
    ] });
  } else if (!existingSafetyReport.citizenId) {
    await prisma.report.update({ where: { id: existingSafetyReport.id }, data: { citizenId: sanPabloCitizen.id } });
  }

  const regionalTenant = await prisma.tenant.upsert({
    where: { slug: 'laguna-province' },
    update: {
      name: 'Laguna Province Connect',
      cityName: 'Laguna Province',
      tagline: 'Coordinated public service requests for provincial communities.',
      description: 'A shared service portal for provincial concerns, department routing, public contacts, and citizen updates across local communities.',
      address: 'Laguna, Philippines',
      email: 'citizen.services@laguna.local',
      phone: '+63 49 530 1000',
      primaryColor: '#1f6feb',
      isActive: true
    },
    create: {
      slug: 'laguna-province',
      name: 'Laguna Province Connect',
      cityName: 'Laguna Province',
      tagline: 'Coordinated public service requests for provincial communities.',
      description: 'A shared service portal for provincial concerns, department routing, public contacts, and citizen updates across local communities.',
      address: 'Laguna, Philippines',
      email: 'citizen.services@laguna.local',
      phone: '+63 49 530 1000',
      primaryColor: '#1f6feb'
    }
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: regionalTenant.id, email: 'admin@laguna.local' } },
    update: { name: 'Provincial Operations Admin', passwordHash, role: 'ADMIN', isActive: true },
    create: { tenantId: regionalTenant.id, name: 'Provincial Operations Admin', email: 'admin@laguna.local', passwordHash, role: 'ADMIN', isActive: true }
  });

  const regionalCitizen = await prisma.citizen.upsert({
    where: { tenantId_email: { tenantId: regionalTenant.id, email: 'ana.reyes@laguna.local' } },
    update: { name: 'Ana Reyes', phone: '+63 918 225 7741', passwordHash: citizenPasswordHash, isActive: true },
    create: { tenantId: regionalTenant.id, name: 'Ana Reyes', email: 'ana.reyes@laguna.local', phone: '+63 918 225 7741', passwordHash: citizenPasswordHash }
  });

  const regionalDepartments = [
    { name: 'Provincial Helpdesk', email: 'helpdesk@laguna.local', phone: '+63 49 530 1001' },
    { name: 'Engineering Coordination Office', email: 'engineering@laguna.local', phone: '+63 49 530 1002' },
    { name: 'Public Safety Coordination Desk', email: 'safety@laguna.local', phone: '+63 49 530 1003' }
  ];

  for (const department of regionalDepartments) {
    await prisma.department.upsert({
      where: { tenantId_name: { tenantId: regionalTenant.id, name: department.name } },
      update: { ...department, isActive: true },
      create: { tenantId: regionalTenant.id, ...department, isActive: true }
    });
  }

  const regionalCategories = [
    ['Road and Sidewalk', 'Road hazards, sidewalk issues, and provincial path concerns.'],
    ['Sanitation', 'Waste collection, cleanup, and sanitation concerns.'],
    ['Safety Concern', 'Public safety issues that need staff review.']
  ];

  for (const [name, description] of regionalCategories) {
    await prisma.reportCategory.upsert({
      where: { tenantId_name: { tenantId: regionalTenant.id, name } },
      update: { description, isActive: true },
      create: { tenantId: regionalTenant.id, name, description, isActive: true }
    });
  }

  await prisma.service.deleteMany({ where: { tenantId: regionalTenant.id } });
  await prisma.hotline.deleteMany({ where: { tenantId: regionalTenant.id } });
  await prisma.newsPost.deleteMany({ where: { tenantId: regionalTenant.id } });

  await prisma.service.createMany({ data: [
    { tenantId: regionalTenant.id, title: 'Provincial Helpdesk Requests', description: 'Route general citizen concerns to the provincial helpdesk team for coordination.', department: 'Provincial Helpdesk', sortOrder: 1 },
    { tenantId: regionalTenant.id, title: 'Engineering Coordination', description: 'Coordinate road, sidewalk, drainage, lighting, and public facility concerns.', department: 'Engineering Coordination Office', sortOrder: 2 },
    { tenantId: regionalTenant.id, title: 'Public Documents and Forms', description: 'Publish forms, advisories, and public information links for residents.', department: 'Provincial Helpdesk', sortOrder: 3 }
  ] });

  await prisma.hotline.createMany({ data: [
    { tenantId: regionalTenant.id, name: 'Emergency Response', description: 'Urgent emergency assistance and response coordination.', phone: '911', isEmergency: true, sortOrder: 1 },
    { tenantId: regionalTenant.id, name: 'Provincial Helpdesk', description: 'General service inquiries and request routing.', phone: '+63 49 530 1001', sortOrder: 2 }
  ] });

  await prisma.newsPost.createMany({ data: [
    { tenantId: regionalTenant.id, title: 'Provincial service portal launched', excerpt: 'Residents can submit concerns and track coordinated responses online.', content: 'Laguna Province Connect supports public concern routing, service discovery, and request tracking across participating communities.', publishedAt: new Date() }
  ] });

  const regionalRoadCategory = await prisma.reportCategory.findFirstOrThrow({ where: { tenantId: regionalTenant.id, name: 'Road and Sidewalk' } });
  const regionalEngineering = await prisma.department.findFirstOrThrow({ where: { tenantId: regionalTenant.id, name: 'Engineering Coordination Office' } });
  const existingRegionalReport = await prisma.report.findFirst({ where: { tenantId: regionalTenant.id, referenceCode: 'LPC-2026-0001' } });
  if (!existingRegionalReport) {
    const report = await prisma.report.create({
      data: {
        tenantId: regionalTenant.id,
        categoryId: regionalRoadCategory.id,
        departmentId: regionalEngineering.id,
        citizenId: regionalCitizen.id,
        referenceCode: 'LPC-2026-0001',
        reporterName: 'Ana Reyes',
        reporterEmail: 'ana.reyes@laguna.local',
        reporterPhone: '+63 918 225 7741',
        title: 'Sidewalk repair request near transport terminal',
        description: 'A cracked sidewalk section near the transport terminal needs inspection and repair coordination.',
        locationText: 'Provincial transport terminal walkway',
        status: 'IN_PROGRESS',
        priority: 'NORMAL'
      }
    });
    await prisma.reportUpdate.createMany({ data: [
      { reportId: report.id, status: 'SUBMITTED', message: 'The request was submitted successfully.', isPublic: true },
      { reportId: report.id, status: 'IN_PROGRESS', message: 'The engineering coordination team started review.', isPublic: true }
    ] });
  } else if (!existingRegionalReport.citizenId) {
    await prisma.report.update({ where: { id: existingRegionalReport.id }, data: { citizenId: regionalCitizen.id } });
  }

  console.log('Database setup completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

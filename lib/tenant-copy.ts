export type TenantOrgType = 'GOVERNMENT' | 'NGO' | 'COMMUNITY' | 'BUSINESS' | 'COOPERATIVE';

export type TenantCopy = {
  orgType: TenantOrgType;
  personLabel: string;
  payCta: string;
  payNav: string;
  reportLabel: string;
  reportNav: string;
  walletOrgLabel: string;
  contactSection: string;
  contactEmail: string;
  paymentsSubtitle: string;
  programsLabel: string;
  isGovernment: boolean;
};

const copyByOrg: Record<TenantOrgType, Omit<TenantCopy, 'orgType' | 'isGovernment'>> = {
  GOVERNMENT: {
    personLabel: 'Citizen',
    payCta: 'Pay a fee',
    payNav: 'Pay a fee',
    reportLabel: 'Report a concern',
    reportNav: 'Report',
    walletOrgLabel: 'City wallet',
    contactSection: 'City contact',
    contactEmail: 'Email the city',
    paymentsSubtitle: 'Pay fees and get a public receipt',
    programsLabel: 'Civic programs'
  },
  NGO: {
    personLabel: 'Supporter',
    payCta: 'Donate',
    payNav: 'Donate',
    reportLabel: 'Submit a request',
    reportNav: 'Request',
    walletOrgLabel: 'Organization wallet',
    contactSection: 'Contact us',
    contactEmail: 'Email the organization',
    paymentsSubtitle: 'Donate and get a public receipt',
    programsLabel: 'Programs & aid'
  },
  COMMUNITY: {
    personLabel: 'Member',
    payCta: 'Pay dues',
    payNav: 'Pay dues',
    reportLabel: 'Submit a request',
    reportNav: 'Request',
    walletOrgLabel: 'Club treasury',
    contactSection: 'Contact us',
    contactEmail: 'Email the club',
    paymentsSubtitle: 'Pay dues or contribute with a public receipt',
    programsLabel: 'Programs & prizes'
  },
  BUSINESS: {
    personLabel: 'Member',
    payCta: 'Pay invoice',
    payNav: 'Pay',
    reportLabel: 'Submit a request',
    reportNav: 'Request',
    walletOrgLabel: 'Guild wallet',
    contactSection: 'Contact us',
    contactEmail: 'Email the guild',
    paymentsSubtitle: 'Pay invoices and get verifiable income proof',
    programsLabel: 'Member programs'
  },
  COOPERATIVE: {
    personLabel: 'Member',
    payCta: 'Pay',
    payNav: 'Pay',
    reportLabel: 'Submit a request',
    reportNav: 'Request',
    walletOrgLabel: 'Co-op wallet',
    contactSection: 'Contact us',
    contactEmail: 'Email the co-op',
    paymentsSubtitle: 'Pay and get a public receipt',
    programsLabel: 'Co-op programs'
  }
};

export function normalizeOrgType(value?: string | null): TenantOrgType {
  const normalized = String(value || 'GOVERNMENT').toUpperCase();
  if (normalized in copyByOrg) {
    return normalized as TenantOrgType;
  }
  return 'GOVERNMENT';
}

export function getTenantCopy(orgType?: string | null): TenantCopy {
  const type = normalizeOrgType(orgType);
  return {
    orgType: type,
    isGovernment: type === 'GOVERNMENT',
    ...copyByOrg[type]
  };
}

export function serviceAmountLabel(serviceKind?: string | null) {
  switch (serviceKind) {
    case 'CAMPAIGN':
      return 'Suggested gift';
    case 'DONATION':
      return 'Suggested donation';
    case 'MEMBERSHIP':
      return 'Dues';
    default:
      return 'Amount';
  }
}

export function servicePayLabel(serviceKind?: string | null) {
  switch (serviceKind) {
    case 'CAMPAIGN':
      return 'Donate';
    case 'DONATION':
      return 'Give';
    case 'MEMBERSHIP':
      return 'Pay dues';
    default:
      return 'Pay';
  }
}

export function paymentRequestLabel(serviceKind?: string | null) {
  switch (serviceKind) {
    case 'CAMPAIGN':
    case 'DONATION':
      return 'Donation request';
    case 'MEMBERSHIP':
      return 'Membership payment';
    default:
      return 'Payment request';
  }
}

export function orgTypeBadge(orgType?: string | null) {
  switch (normalizeOrgType(orgType)) {
    case 'NGO':
      return 'NGO';
    case 'COMMUNITY':
      return 'Community';
    case 'BUSINESS':
      return 'Business';
    case 'COOPERATIVE':
      return 'Cooperative';
    default:
      return 'Government';
  }
}

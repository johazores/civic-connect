import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const adminCookieName = 'civic_token';
const citizenCookieName = 'civic_citizen_token';

export const safeTenantSelect = {
  id: true,
  slug: true,
  name: true,
  cityName: true,
  tagline: true,
  description: true,
  address: true,
  email: true,
  phone: true,
  primaryColor: true,
  stellarReceivingPublicKey: true,
  stellarNetwork: true,
  stellarNetworkPassphrase: true,
  stellarHorizonUrl: true,
  stellarFriendbotUrl: true,
  stellarDefaultAssetCode: true,
  stellarDefaultAssetIssuer: true,
  stellarWalletStatus: true,
  stellarWalletLastCheckedAt: true,
  stellarWalletLastFundedAt: true,
  stellarWalletError: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

export type AuthUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
};

export type CitizenAuthUser = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
};

type AdminAuthToken = {
  userId: string;
  tenantId: string;
};

type CitizenAuthToken = {
  citizenId: string;
  tenantId: string;
};

function getSecret() {
  return process.env.ADMIN_JWT_SECRET || 'dev-only-secret';
}

export function signAuthToken(payload: AdminAuthToken) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function signCitizenAuthToken(payload: CitizenAuthToken) {
  return jwt.sign(payload, getSecret(), { expiresIn: '30d' });
}

function createCookie(name: string, token: string, maxAge: number) {
  return `${name}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

export function setAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader('Set-Cookie', createCookie(adminCookieName, token, 60 * 60 * 24 * 7));
}

export function setCitizenAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader('Set-Cookie', createCookie(citizenCookieName, token, 60 * 60 * 24 * 30));
}

export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${adminCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

export function clearCitizenAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${citizenCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function readCookie(req: NextApiRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const item = cookie.split(';').find((part) => part.trim().startsWith(`${name}=`));
  return item?.split('=')[1];
}

export async function getAuthUser(req: NextApiRequest): Promise<AuthUser | null> {
  const token = readCookie(req, adminCookieName);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getSecret()) as AdminAuthToken;

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        tenantId: payload.tenantId,
        isActive: true
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true
      }
    });

    return user;
  } catch {
    return null;
  }
}

export async function getCitizenAuthUser(req: NextApiRequest): Promise<CitizenAuthUser | null> {
  const token = readCookie(req, citizenCookieName);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getSecret()) as CitizenAuthToken;

    const citizen = await prisma.citizen.findFirst({
      where: {
        id: payload.citizenId,
        tenantId: payload.tenantId,
        isActive: true
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true
      }
    });

    return citizen;
  } catch {
    return null;
  }
}

export async function requireTenantAdmin(req: NextApiRequest, tenantSlug: string) {
  const user = await getAuthUser(req);

  if (!user) {
    return null;
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: user.tenantId,
      slug: tenantSlug,
      isActive: true
    },
    select: safeTenantSelect
  });

  if (!tenant) {
    return null;
  }

  return { user, tenant };
}

export async function requireTenantCitizen(req: NextApiRequest, tenantSlug: string) {
  const citizen = await getCitizenAuthUser(req);

  if (!citizen) {
    return null;
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      id: citizen.tenantId,
      slug: tenantSlug,
      isActive: true
    },
    select: safeTenantSelect
  });

  if (!tenant) {
    return null;
  }

  return { citizen, tenant };
}

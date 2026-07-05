export type AuthProvider = 'custom' | 'clerk';

export function resolveAuthProvider(value = process.env.NEXT_PUBLIC_AUTH_PROVIDER): AuthProvider {
  return value === 'clerk' ? 'clerk' : 'custom';
}

export const authProvider = resolveAuthProvider();

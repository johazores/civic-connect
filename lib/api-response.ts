import type { NextApiResponse } from 'next';

export function ok<T>(res: NextApiResponse, data: T) {
  return res.status(200).json({ data });
}

export function created<T>(res: NextApiResponse, data: T) {
  return res.status(201).json({ data });
}

export function badRequest(res: NextApiResponse, message = 'Bad request') {
  return res.status(400).json({ error: message });
}

export function unauthorized(res: NextApiResponse, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

export function forbidden(res: NextApiResponse, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

export function notFound(res: NextApiResponse, message = 'Not found') {
  return res.status(404).json({ error: message });
}

export function methodNotAllowed(res: NextApiResponse) {
  return res.status(405).json({ error: 'Method not allowed' });
}

export function serverError(res: NextApiResponse, error: unknown) {
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong' });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, serverError } from '@/lib/api-response';
import { asString } from '@/lib/request';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxUploadBytes = 4 * 1024 * 1024;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb'
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const mimeType = asString(req.body?.mimeType);
    const dataUrl = asString(req.body?.dataUrl);

    if (!allowedMimeTypes.includes(mimeType)) {
      return badRequest(res, 'Only JPG, PNG, WEBP, and GIF photos are allowed.');
    }

    const expectedPrefix = `data:${mimeType};base64,`;

    if (!dataUrl.startsWith(expectedPrefix)) {
      return badRequest(res, 'Invalid photo data.');
    }

    const base64 = dataUrl.slice(expectedPrefix.length);
    const buffer = Buffer.from(base64, 'base64');

    if (buffer.length === 0) {
      return badRequest(res, 'Photo is empty.');
    }

    if (buffer.length > maxUploadBytes) {
      return badRequest(res, 'Photo must be 4MB or smaller.');
    }

    return created(res, {
      imageUrl: dataUrl
    });
  } catch (error) {
    return serverError(res, error);
  }
}

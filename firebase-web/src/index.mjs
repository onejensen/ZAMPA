import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { onRequest as offerPage } from '../../functions/o/[id].js';
import { onRequest as restaurantPage } from '../../functions/r/[id].js';
import { routeFor, toFetchRequest, sendFetchResponse } from './adapter.mjs';

// Una sola función para /o y /r: una instancia caliente sirve las dos rutas.
export const webSharePage = onRequest(
  { region: 'us-central1', memory: '256MiB', maxInstances: 10 },
  async (req, res) => {
    const route = routeFor(req.path);
    if (!route) {
      res.status(404).set('Cache-Control', 'no-store').send('Not found');
      return;
    }
    const handler = route.kind === 'o' ? offerPage : restaurantPage;
    try {
      const response = await handler({ request: toFetchRequest(req), params: { id: route.id } });
      await sendFetchResponse(res, response);
    } catch (error) {
      logger.error('webSharePage', { path: req.path, error: String(error?.stack || error) });
      res.status(500).set('Cache-Control', 'no-store').send('Error');
    }
  },
);

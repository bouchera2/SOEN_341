import express, { Request, Response } from 'express';
import request from 'supertest';

const app = express();
app.get('/test', (_req: Request, res: Response) => res.json({ success: true }));

test('GET /test responds with success:true', async () => {
  await request(app).get('/test')
    .expect(200)
    .expect(res => {
      expect(res.body.success).toBe(true);
    });
});


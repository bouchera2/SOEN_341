import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import eventRoutes from './routes/eventsCreation.js';
import { ApiResponse } from './types/index.js';
import authRoutes from './routes/authRouter.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
} else {
  // Development route
  app.get('/', (req: Request, res: Response) => {
    res.send(`Hello world! API running in development mode.`);
  });
}

app.get('/eventdetails', (req: Request, res: Response) => {
 
  res.send(`test`);


});

app.use('/CreateEvent', eventRoutes);

app.use('/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  } as ApiResponse);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  } as ApiResponse);
});

const port = parseInt(process.env.PORT || '3002'); 
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

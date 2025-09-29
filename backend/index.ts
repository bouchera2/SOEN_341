import express, { Request, Response } from 'express';
import eventRoutes from './routes/eventsCreation.js';
import { ApiResponse } from './types/index.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// default route
app.get('/', (req: Request, res: Response) => {
 
  res.send(`Hello world !`);


});

// Event routes
app.use('/CreateEvent', eventRoutes);


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

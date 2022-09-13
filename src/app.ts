import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import questionRoutes from './routes/questions';
import answerRoutes from './routes/answers';

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use('/qa/questions', questionRoutes);
app.use('/qa/answers', answerRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(3000);

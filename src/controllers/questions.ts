import { RequestHandler } from "express";

import { Question } from '../models/questions';

const Questions: Question[] = [];

export const createQuestion: RequestHandler = (req, res, next) => {
  const text = (req.body as { text: string }).text;
  const newQuestion = new Question(Math.random().toString(), text);

  Questions.push(newQuestion);

  res.status(201).json({ message: 'Created the question.', createdQuestion: newQuestion })
};
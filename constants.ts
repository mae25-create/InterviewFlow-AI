
import { Question } from './types';

export const QUESTIONS: Question[] = [
  // Tell me about yourself
  { id: 't1', category: 'Tell me about yourself', difficulty: 'Easy', text: "Walk me through your background and how you got to where you are today." },
  { id: 't2', category: 'Tell me about yourself', difficulty: 'Medium', text: "What is your professional 'superpower' and how has it shaped your career path?" },
  { id: 't3', category: 'Tell me about yourself', difficulty: 'Hard', text: "If you had to summarize your entire career impact into a 30-second elevator pitch for a CEO, what would it be?" },
  { id: 't4', category: 'Tell me about yourself', difficulty: 'Easy', text: "What are you looking for in your next role that your current one lacks?" },
  { id: 't5', category: 'Tell me about yourself', difficulty: 'Medium', text: "Describe a situation where your unique background allowed you to solve a problem others couldn't." },

  // Behavioral - Easy
  { id: 'b1', category: 'Behavioral', difficulty: 'Easy', text: "Tell me about a time you had to work with a difficult teammate." },
  { id: 'b2', category: 'Behavioral', difficulty: 'Easy', text: "Describe a successful project you were part of and your specific role." },
  // Behavioral - Medium
  { id: 'b3', category: 'Behavioral', difficulty: 'Medium', text: "Tell me about a time you failed. What was the impact, and how did you recover?" },
  { id: 'b4', category: 'Behavioral', difficulty: 'Medium', text: "Describe a situation where you had to disagree with your manager to achieve a better outcome." },
  // Behavioral - Hard
  { id: 'b5', category: 'Behavioral', difficulty: 'Hard', text: "Tell me about the most politically complex situation you've navigated at work." },
  { id: 'b6', category: 'Behavioral', difficulty: 'Hard', text: "Give an example of a time you had to make a high-stakes decision with only 50% of the information you needed." },

  // Product/Strategy - Easy
  { id: 'p1', category: 'Product/Strategy', difficulty: 'Easy', text: "What is your favorite product and why do you like its user experience?" },
  { id: 'p2', category: 'Product/Strategy', difficulty: 'Easy', text: "How would you explain what a 'Product Manager' does to a 10-year-old?" },
  // Product/Strategy - Medium
  { id: 'p3', category: 'Product/Strategy', difficulty: 'Medium', text: "If you were the PM for Spotify, how would you increase the conversion from free to premium?" },
  { id: 'p4', category: 'Product/Strategy', difficulty: 'Medium', text: "How do you handle a situation where data contradicts your product intuition?" },
  // Product/Strategy - Hard
  { id: 'p5', category: 'Product/Strategy', difficulty: 'Hard', text: "A major competitor just launched a feature that makes your core product obsolete. What is your 30-day plan?" },
  { id: 'p6', category: 'Product/Strategy', difficulty: 'Hard', text: "How would you design a logistics system for a colony on Mars with a 20-minute communication lag?" },

  // Data/Analytics - Easy
  { id: 'd1', category: 'Data/Analytics', difficulty: 'Easy', text: "What are the first three metrics you look at for a new e-commerce website?" },
  { id: 'd2', category: 'Data/Analytics', difficulty: 'Easy', text: "Explain the difference between mean and median to a marketing team." },
  // Data/Analytics - Medium
  { id: 'd3', category: 'Data/Analytics', difficulty: 'Medium', text: "How would you investigate a sudden 10% drop in Daily Active Users (DAU)?" },
  { id: 'd4', category: 'Data/Analytics', difficulty: 'Medium', text: "Describe a time you used data to stop a project that was heading in the wrong direction." },
  // Data/Analytics - Hard
  { id: 'd5', category: 'Data/Analytics', difficulty: 'Hard', text: "How would you build a model to predict customer churn in a highly seasonal business?" },
  { id: 'd6', category: 'Data/Analytics', difficulty: 'Hard', text: "Walk me through how you would set up an A/B test for a feature where the primary metric is sensitive to network effects." },

  // Leadership - Easy
  { id: 'l1', category: 'Leadership', difficulty: 'Easy', text: "How do you like to give and receive feedback?" },
  { id: 'l2', category: 'Leadership', difficulty: 'Easy', text: "Describe your ideal team culture." },
  // Leadership - Medium
  { id: 'l3', category: 'Leadership', difficulty: 'Medium', text: "Tell me about a time you had to deliver difficult news to your entire team." },
  { id: 'l4', category: 'Leadership', difficulty: 'Medium', text: "How do you manage a high-performer who is becoming a 'brilliant jerk'?" },
  // Leadership - Hard
  { id: 'l5', category: 'Leadership', difficulty: 'Hard', text: "Describe a time you had to lead a team through a significant organizational pivot or mass layoff." },
  { id: 'l6', category: 'Leadership', difficulty: 'Hard', text: "How do you build a leadership pipeline within a remote-first organization?" }
];

export const LAYOUT_CONFIGS = {
  '9:16': 'aspect-[9/16] max-h-[80vh]',
  '16:9': 'aspect-[16/9] w-full',
  '3:4': 'aspect-[3/4] max-h-[80vh]',
  '1:1': 'aspect-square max-h-[70vh]'
};

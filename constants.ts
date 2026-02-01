
import { Question } from './types';

export const QUESTIONS: Question[] = [
  // Tell me about yourself
  { id: 't1', category: 'Tell me about yourself', text: "Walk me through your background and how you got to where you are today." },
  { id: 't2', category: 'Tell me about yourself', text: "What is your professional 'superpower' and how do you use it?" },
  { id: 't3', category: 'Tell me about yourself', text: "How would your last manager describe you in three words?" },
  { id: 't4', category: 'Tell me about yourself', text: "What are you looking for in your next role that you don't have now?" },
  { id: 't5', category: 'Tell me about yourself', text: "What is the most significant project you've worked on recently?" },
  { id: 't6', category: 'Tell me about yourself', text: "Why are you interested in joining this specific industry?" },
  { id: 't7', category: 'Tell me about yourself', text: "What's something not on your resume that you'd like me to know?" },
  { id: 't8', category: 'Tell me about yourself', text: "Where do you see your career heading in the next 3-5 years?" },
  { id: 't9', category: 'Tell me about yourself', text: "What motivates you to get up and do your best work every day?" },
  { id: 't10', category: 'Tell me about yourself', text: "Describe a situation where you had to learn a new skill very quickly." },

  // Behavioral
  { id: 'b1', category: 'Behavioral', text: "Tell me about a time you failed. What did you learn?" },
  { id: 'b2', category: 'Behavioral', text: "Describe a situation where you had to handle a difficult coworker." },
  { id: 'b3', category: 'Behavioral', text: "Tell me about a time you went above and beyond for a customer or client." },
  { id: 'b4', category: 'Behavioral', text: "Give an example of a time you had to make a split-second decision." },
  { id: 'b5', category: 'Behavioral', text: "Tell me about a time you disagreed with your manager. How was it resolved?" },
  { id: 'b6', category: 'Behavioral', text: "Describe a time you were under a lot of pressure. How did you handle it?" },
  { id: 'b7', category: 'Behavioral', text: "Tell me about a time you led a project with a tight deadline." },
  { id: 'b8', category: 'Behavioral', text: "Give an example of how you handle multiple competing priorities." },
  { id: 'b9', category: 'Behavioral', text: "Tell me about a time you had to adapt to a major change at work." },
  { id: 'b10', category: 'Behavioral', text: "Describe a successful team project you were part of and your specific role." },
  { id: 'b11', category: 'Behavioral', text: "Tell me about a time you received critical feedback. How did you react?" },
  { id: 'b12', category: 'Behavioral', text: "Describe a situation where you had to explain something complex to someone without a technical background." },
  { id: 'b13', category: 'Behavioral', text: "Tell me about a time you took a calculated risk." },
  { id: 'b14', category: 'Behavioral', text: "Give an example of a time you had to solve a problem with very limited resources." },
  { id: 'b15', category: 'Behavioral', text: "Describe a time you identified a process inefficiency and improved it." },

  // Product/Strategy
  { id: 'p1', category: 'Product/Strategy', text: "What is your favorite product and how would you improve it?" },
  { id: 'p2', category: 'Product/Strategy', text: "If you were the PM for a new social media app, what's the first feature you'd build?" },
  { id: 'p3', category: 'Product/Strategy', text: "How do you decide what to include in a product MVP?" },
  { id: 'p4', category: 'Product/Strategy', text: "Tell me about a time you had to pivot a product strategy based on user data." },
  { id: 'p5', category: 'Product/Strategy', text: "How would you measure the success of a new feature rollout?" },
  { id: 'p6', category: 'Product/Strategy', text: "Explain how you prioritize a product roadmap with conflicting stakeholder interests." },
  { id: 'p7', category: 'Product/Strategy', text: "What is the biggest threat to Netflix's business model right now?" },
  { id: 'p8', category: 'Product/Strategy', text: "How would you design an elevator for a 1000-story building?" },
  { id: 'p9', category: 'Product/Strategy', text: "Pick a declining product. How would you revitalize it?" },
  { id: 'p10', category: 'Product/Strategy', text: "Describe a time you had to say 'no' to a feature request from a key executive." },
  { id: 'p11', category: 'Product/Strategy', text: "How do you handle feature creep during development?" },
  { id: 'p12', category: 'Product/Strategy', text: "What role does user research play in your product design process?" },
  { id: 'p13', category: 'Product/Strategy', text: "How would you price a new SaaS product for the enterprise market?" },
  { id: 'p14', category: 'Product/Strategy', text: "Explain a 'north star metric' and why it's important." },
  { id: 'p15', category: 'Product/Strategy', text: "Describe a time you used 'design thinking' to solve a problem." },

  // Data/Analytics
  { id: 'd1', category: 'Data/Analytics', text: "How would you investigate a 5% drop in user retention?" },
  { id: 'd2', category: 'Data/Analytics', text: "Explain A/B testing to a non-technical stakeholder." },
  { id: 'd3', category: 'Data/Analytics', text: "Describe a time you used data to change a business decision." },
  { id: 'd4', category: 'Data/Analytics', text: "What are the most important metrics for an e-commerce platform?" },
  { id: 'd5', category: 'Data/Analytics', text: "How do you handle outliers in a dataset?" },
  { id: 'd6', category: 'Data/Analytics', text: "What is the difference between correlation and causation? Give an example." },
  { id: 'd7', category: 'Data/Analytics', text: "How would you model customer lifetime value (CLV)?" },
  { id: 'd8', category: 'Data/Analytics', text: "Describe a time you had to clean a particularly messy dataset." },
  { id: 'd9', category: 'Data/Analytics', text: "How do you ensure the quality and integrity of your data analysis?" },
  { id: 'd10', category: 'Data/Analytics', text: "What is your favorite data visualization tool and why?" },
  { id: 'd11', category: 'Data/Analytics', text: "Explain the concept of 'p-value' in simple terms." },
  { id: 'd12', category: 'Data/Analytics', text: "How would you decide when to stop an A/B test?" },
  { id: 'd13', category: 'Data/Analytics', text: "Tell me about a time you found an insight that contradicted the team's intuition." },
  { id: 'd14', category: 'Data/Analytics', text: "What are the limitations of using historical data to predict future trends?" },
  { id: 'd15', category: 'Data/Analytics', text: "How do you communicate technical data findings to a broad audience?" },

  // Leadership
  { id: 'l1', category: 'Leadership', text: "Describe your leadership style." },
  { id: 'l2', category: 'Leadership', text: "Tell me about a time you had to deliver difficult news to your team." },
  { id: 'l3', category: 'Leadership', text: "How do you motivate a team that is feeling burnt out?" },
  { id: 'l4', category: 'Leadership', text: "Tell me about a time you mentored someone and saw them grow." },
  { id: 'l5', category: 'Leadership', text: "How do you handle a high-performer who is toxic to the team culture?" },
  { id: 'l6', category: 'Leadership', text: "Describe a time you had to lead a team through a period of extreme ambiguity." },
  { id: 'l7', category: 'Leadership', text: "How do you delegate tasks effectively?" },
  { id: 'l8', category: 'Leadership', text: "Tell me about a time you built a team from scratch." },
  { id: 'l9', category: 'Leadership', text: "What is the hardest part of being a leader for you?" },
  { id: 'l10', category: 'Leadership', text: "How do you foster an inclusive environment in your team?" },
  { id: 'l11', category: 'Leadership', text: "Describe a time you had to manage up. What was the outcome?" },
  { id: 'l12', category: 'Leadership', text: "How do you handle conflicts between two direct reports?" },
  { id: 'l13', category: 'Leadership', text: "What is your approach to performance reviews and feedback?" },
  { id: 'l14', category: 'Leadership', text: "Describe a time you had to make an unpopular decision for the good of the team." },
  { id: 'l15', category: 'Leadership', text: "How do you balance being a hands-on leader vs. giving autonomy?" }
];

export const LAYOUT_CONFIGS = {
  '9:16': 'aspect-[9/16] max-h-[80vh]',
  '16:9': 'aspect-[16/9] w-full',
  '3:4': 'aspect-[3/4] max-h-[80vh]',
  '1:1': 'aspect-square max-h-[70vh]'
};

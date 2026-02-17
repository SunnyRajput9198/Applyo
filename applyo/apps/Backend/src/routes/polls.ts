import express, { Request, Response } from 'express';
import { PrismaClient } from '../../../../packages/db/generated/prisma';
import { generateSessionId, getClientIP } from '../utils/session';

const router = express.Router();
const prisma = new PrismaClient();

// CREATE POLL
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, options } = req.body;
    
    // Validation
    if (!question || !options || options.length < 2) {
      res.status(400).json({ 
        error: 'Question and at least 2 options required' 
      });
      return;
    }
    
    const poll = await prisma.poll.create({
      data: {
        question,
        options
      }
    });
    
    res.json({ 
      pollId: poll.id,
      shareLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/poll/${poll.id}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// GET POLL BY ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const pollId = parseInt(req.params.id as string);
    
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { votes: true }
    });
    
    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }
    
    // Calculate results

    // Replace these two instances in polls.ts
const results = poll.options.map((option: string, index: number) => ({
  option,
  votes: poll.votes.filter((v: any) => v.optionIndex === index).length
}));
    
    res.json({
      id: poll.id,
      question: poll.question,
      options: poll.options,
      results,
      totalVotes: poll.votes.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// VOTE ON POLL
router.post('/:id/vote', async (req: Request, res: Response): Promise<void> => {
  try {
    const pollId = parseInt(req.params.id as string);
    const { optionIndex, sessionId: clientSessionId } = req.body;
    
    // Get or generate session ID
    const sessionId = clientSessionId || generateSessionId();
    const voterIP = getClientIP(req);
    
    // Validation
    if (optionIndex === undefined) {
      res.status(400).json({ error: 'Option index required' });
      return;
    }
    
    // Check if already voted (Anti-abuse mechanism #1)
    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_sessionId: {
          pollId,
          sessionId
        }
      }
    });
    
    if (existingVote) {
      res.status(400).json({ 
        error: 'You have already voted',
        sessionId 
      });
      return;
    }
    
    // Create vote
    await prisma.vote.create({
      data: {
        pollId,
        optionIndex,
        sessionId,
        voterIP
      }
    });
    
    // Get updated poll results
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { votes: true }
    });
    
    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }
    
    const results = poll.options.map((option, index) => ({
      option,
      votes: poll.votes.filter(v => v.optionIndex === index).length
    }));
    
    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    io.to(`poll-${pollId}`).emit('vote-update', {
      pollId,
      results,
      totalVotes: poll.votes.length
    });
    
    res.json({ 
      success: true,
      sessionId,
      results,
      totalVotes: poll.votes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

export default router;
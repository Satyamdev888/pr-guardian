import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import our new helper

export async function POST(req: NextRequest) {
  try {
    const eventType = req.headers.get('x-github-event');
    const body = await req.json();

    console.log(`📥 Received Event: ${eventType}`);

    // We only care about PR events for now
    if (eventType === 'pull_request') {
      const { action, pull_request, repository, sender } = body;

      console.log(`🚀 Processing PR #${pull_request.number}: ${action}`);

      // 1. Ensure the Repository exists in our DB
      const repo = await prisma.repository.upsert({
        where: { githubId: repository.id },
        update: { name: repository.full_name },
        create: {
          githubId: repository.id,
          name: repository.full_name,
        },
      });

      // 2. Save or Update the Pull Request
      const pr = await prisma.pullRequest.upsert({
        where: { githubId: pull_request.id },
        update: {
          title: pull_request.title,
          status: pull_request.state, // 'open', 'closed'
          updatedAt: new Date(),
        },
        create: {
          githubId: pull_request.id,
          number: pull_request.number,
          title: pull_request.title,
          status: pull_request.state,
          repoId: repo.id, // Link to the repo we just found/created
          author: sender.login,
        },
      });

      console.log(`✅ Database Updated: PR #${pr.number} is now "${pr.status}"`);
    }

    return NextResponse.json({ message: 'Event processed' }, { status: 200 });

  } catch (error) {
    console.error('❌ Database Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
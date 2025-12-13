import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runGuardian } from '@/lib/guardian'; // 👈 Import the new service

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = req.headers.get('x-github-event');

    console.log(`📨 Received event: ${eventType}`);

    if (eventType === 'pull_request') {
      const { action, pull_request, repository } = payload;
      
      // Trigger on 'opened' (new PR) or 'synchronize' (new commit pushed)
      if (action === 'opened' || action === 'synchronize') {
        
        // 1. Upsert Repository
        const repo = await prisma.repository.upsert({
          where: { githubId: repository.id },
          update: { name: repository.full_name },
          create: {
            githubId: repository.id,
            name: repository.full_name,
            url: repository.html_url
          }
        });

        // 2. Upsert Pull Request
        const pr = await prisma.pullRequest.upsert({
          where: { githubId: pull_request.id },
          update: {
            title: pull_request.title,
            status: pull_request.state,
            updatedAt: new Date()
          },
          create: {
            githubId: pull_request.id,
            number: pull_request.number,
            title: pull_request.title,
            status: pull_request.state,
            repoId: repo.id,
            author: pull_request.user.login
          }
        });

        console.log(`✅ Synced PR #${pr.number} to Database`);

        // 3. 🚀 TRIGGER THE AI (Fire and Forget)
        // We do NOT await this, so the webhook responds "OK" immediately to GitHub.
        runGuardian(pr.id); 
      }
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
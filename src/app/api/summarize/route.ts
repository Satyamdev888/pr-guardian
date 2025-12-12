import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzePR } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { prId } = await req.json();

    // 1. Fetch PR
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { comments: true }
    });

    if (!pr) return NextResponse.json({ error: 'PR not found' }, { status: 404 });

    // 2. Prepare Data
    const commentTexts = pr.comments.map(c => `${c.author}: ${c.body}`);
    const dummyDiff = "User added console.log and used 'any' type in typescript file."; 

    // 3. Ask AI
    const analysis = await analyzePR(dummyDiff, commentTexts);

    if (analysis) {
      // 4. SAVE the result to Database! 💾
      await prisma.pullRequest.update({
        where: { id: prId },
        data: {
          score: analysis.score,
          summary: analysis.summary,
        }
      });
      console.log(`✅ Saved Score (${analysis.score}) for PR #${pr.number}`);
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
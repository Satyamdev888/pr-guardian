import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzePR } from '@/lib/gemini';
import { postComment } from '@/lib/github'; // 👈 Import the new reporter

export async function POST(req: NextRequest) {
  try {
    const { prId } = await req.json();

    // 1. Fetch PR AND the Repository details (so we know owner/name)
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { 
        comments: true,
        repository: true // 👈 We need this now!
      }
    });

    if (!pr) return NextResponse.json({ error: 'PR not found' }, { status: 404 });

    // 2. Prepare Data
    const commentTexts = pr.comments.map(c => `${c.author}: ${c.body}`);
    const dummyDiff = "User added console.log and used 'any' type in typescript file."; 

    // 3. Ask AI
    const analysis = await analyzePR(dummyDiff, commentTexts);

    if (analysis) {
      // 4. Save to DB
      await prisma.pullRequest.update({
        where: { id: prId },
        data: {
          score: analysis.score,
          summary: analysis.summary,
        }
      });

      // 5. POST TO GITHUB! 📢
      // We need to split "Satyamdev888/pr-guardian" into "Satyamdev888" and "pr-guardian"
      const [owner, repoName] = pr.repository.name.split('/');
      
      const message = `
### 🛡️ PR Guardian Report
**Score:** ${analysis.score}/100 ${analysis.score > 80 ? '🟢' : '🔴'}

**Summary:**
${analysis.summary}

**Key Suggestions:**
${analysis.suggestions.map((s: string) => `- ${s}`).join('\n')}
      `;

      await postComment(owner, repoName, pr.number, message);
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
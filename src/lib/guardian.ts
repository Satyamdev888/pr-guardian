import { prisma } from '@/lib/prisma';
import { analyzePR } from '@/lib/gemini';
import { postComment } from '@/lib/github';

export async function runGuardian(prId: number) {
  console.log(`🛡️ Running Guardian for PR ID: ${prId}...`);

  try {
    // 1. Fetch PR and Repo details
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: { 
        comments: true,
        repository: true 
      }
    });

    if (!pr) {
      console.error("❌ PR not found in database");
      return;
    }

    // 2. Prepare Data for AI
    // We combine the PR Title, Status, and Comments into a context for the AI
    const commentTexts = pr.comments.map(c => `${c.author}: ${c.body}`);
    const context = `PR Title: ${pr.title}\nStatus: ${pr.status}\n\nUser Comments:\n${commentTexts.join("\n")}`;
    
    // 3. Ask Gemini to analyze
    const analysis = await analyzePR(context, commentTexts);

    if (analysis) {
      // 4. Save Score to DB 💾
      await prisma.pullRequest.update({
        where: { id: prId },
        data: {
          score: analysis.score,
          summary: analysis.summary,
        }
      });
      console.log(`✅ Saved Score (${analysis.score}) to DB`);

      // 5. Post to GitHub 📢
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

  } catch (error) {
    console.error("❌ Guardian Failed:", error);
  }
}
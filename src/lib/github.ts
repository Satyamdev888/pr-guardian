import { Octokit } from "octokit";

export async function postComment(
  owner: string, 
  repo: string, 
  issueNumber: number, 
  message: string
) {
  // 👇 MOVED INSIDE: Only connect when we actually need to post!
  const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN 
  });

  try {
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: issueNumber,
      body: message,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log(`✅ Posted comment to PR #${issueNumber}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to post comment to GitHub:", error);
    return false;
  }
}
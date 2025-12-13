import { prisma } from '@/lib/prisma';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCode, 
  GitPullRequest, 
  Activity 
} from 'lucide-react';

// Force dynamic so data is always fresh
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Fetch data
  const prs = await prisma.pullRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { repository: true }
  });

  // 2. Calculate Real Stats
  const totalPRs = prs.length;
  const scoredPRs = prs.filter(p => p.score !== null);
  const avgScore = scoredPRs.length > 0
    ? Math.round(scoredPRs.reduce((acc, p) => acc + (p.score || 0), 0) / scoredPRs.length)
    : 0;
  const criticalIssues = prs.filter(p => p.score !== null && p.score < 50).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans selection:bg-purple-500/30">
      {/* Background Gradient Blob for visual flair */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              PR Guardian
            </h1>
            <p className="text-gray-400 mt-2">AI-Powered Code Integrity System</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">System Active</span>
          </div>
        </div>

        {/* 📊 Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Average Score */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-purple-500/50 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">Average Health</p>
                <h3 className="text-4xl font-bold mt-2 text-white">{avgScore}%</h3>
              </div>
              <div className={`p-3 rounded-xl ${avgScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <Activity size={24} />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${avgScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>

          {/* Card 2: Total PRs */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Scanned</p>
                <h3 className="text-4xl font-bold mt-2 text-white">{totalPRs}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <GitPullRequest size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Across active repositories</p>
          </div>

          {/* Card 3: Critical Issues */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-red-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">Critical Alerts</p>
                <h3 className="text-4xl font-bold mt-2 text-red-400">{criticalIssues}</h3>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                <AlertTriangle size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">PRs requiring immediate attention</p>
          </div>
        </div>

        {/* 📝 Main Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <FileCode className="text-gray-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Recent Analysis</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-5 font-medium">Repository</th>
                  <th className="p-5 font-medium">Pull Request</th>
                  <th className="p-5 font-medium">Score</th>
                  <th className="p-5 font-medium">Summary</th>
                  <th className="p-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {prs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="font-medium text-gray-300">{pr.repository.name}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-mono">#{pr.number}</span>
                        <span className="text-gray-400 text-sm truncate max-w-[200px]">{pr.title}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {pr.score !== null ? (
                        <div className="flex items-center gap-3">
                          <div className={`text-xl font-bold ${
                            pr.score >= 80 ? 'text-green-400' : 
                            pr.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {pr.score}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                pr.score >= 80 ? 'bg-green-500' : 
                                pr.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${pr.score}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 italic text-sm">Analyzing...</span>
                      )}
                    </td>
                    <td className="p-5 max-w-md">
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {pr.summary || "Pending analysis..."}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        pr.status === 'open' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {pr.status === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                        {pr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {prs.length === 0 && (
              <div className="p-12 text-center">
                <ShieldCheck className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-xl text-gray-300 font-medium">No Data Yet</h3>
                <p className="text-gray-500 mt-2">Trigger a webhook to see live data here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
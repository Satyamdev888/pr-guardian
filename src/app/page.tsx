import { prisma } from '@/lib/prisma';

// Force dynamic rendering so we always see the latest data
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch recent PRs from the Database
  const prs = await prisma.pullRequest.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { repository: true },
    take: 10
  });

  return (
    <main className="min-h-screen bg-black text-green-400 p-8 font-mono">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-12 border-b border-green-800 pb-4">
        <h1 className="text-4xl font-bold tracking-tighter animate-pulse">
          PR GUARDIAN <span className="text-xs align-top opacity-50">v1.0</span>
        </h1>
        <div className="text-right">
          <p className="text-sm opacity-70">SYSTEM STATUS</p>
          <p className="text-green-500 font-bold">ONLINE 🟢</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-green-800 p-6 bg-green-900/10 rounded">
          <h3 className="text-sm opacity-50 uppercase mb-2">Total Scans</h3>
          <p className="text-4xl font-bold">{prs.length}</p>
        </div>
        <div className="border border-green-800 p-6 bg-green-900/10 rounded">
          <h3 className="text-sm opacity-50 uppercase mb-2">High Scores (>80)</h3>
          <p className="text-4xl font-bold text-green-300">
            {prs.filter(p => (p.score || 0) > 80).length}
          </p>
        </div>
        <div className="border border-green-800 p-6 bg-green-900/10 rounded">
          <h3 className="text-sm opacity-50 uppercase mb-2">Critical Issues</h3>
          <p className="text-4xl font-bold text-red-400">
            {prs.filter(p => (p.score || 0) < 50 && p.score !== null).length}
          </p>
        </div>
      </div>

      {/* RECENT ANALYSIS TABLE */}
      <div className="border border-green-800 rounded overflow-hidden">
        <div className="bg-green-900/20 p-4 border-b border-green-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">📡 Live Feed</h2>
          <span className="text-xs animate-pulse text-green-500">RECEIVING DATA...</span>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-900/30 text-green-300 text-sm uppercase">
              <th className="p-4">Score</th>
              <th className="p-4">Repository</th>
              <th className="p-4">PR Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {prs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center opacity-50">
                  No data received yet. Open a PR to trigger the Guardian.
                </td>
              </tr>
            ) : (
              prs.map((pr) => (
                <tr key={pr.id} className="border-b border-green-900/50 hover:bg-green-900/10 transition">
                  <td className="p-4">
                    {pr.score ? (
                      <span className={`font-bold px-2 py-1 rounded ${
                        pr.score > 80 ? 'bg-green-900 text-green-300' : 
                        pr.score < 50 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {pr.score}/100
                      </span>
                    ) : (
                      <span className="opacity-50">PENDING</span>
                    )}
                  </td>
                  <td className="p-4 text-green-300">{pr.repository?.name || 'Unknown'}</td>
                  <td className="p-4 font-medium">{pr.title}</td>
                  <td className="p-4 opacity-70">@{pr.author}</td>
                  <td className="p-4 opacity-50 text-sm">
                    {new Date(pr.updatedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* FOOTER */}
      <footer className="mt-12 text-center text-xs opacity-30">
        PR GUARDIAN SYSTEM // END OF LINE
      </footer>
    </main>
  );
}
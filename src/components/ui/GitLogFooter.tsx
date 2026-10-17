import React, { useEffect, useState } from 'react';
import { GitCommit, Terminal } from 'lucide-react';

interface CommitItem {
  sha: string;
  message: string;
  timeAgo: string;
  url: string;
}

const CACHE_KEY = 'compile_git_log_v3';
const CACHE_TTL = 3600 * 1000; // 1 hour

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (86400 * 1000));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export const GitLogFooter: React.FC = () => {
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check local cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data) && data.length > 0) {
          setCommits(data);
          return;
        }
      }
    } catch {
      // Ignore cache parse error
    }

    // 2. Fetch from public GitHub API silently
    fetch('https://api.github.com/repos/Shivam-io-afk/Portfolio/commits?per_page=3', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const parsed: CommitItem[] = data.slice(0, 3).map((item: any) => ({
            sha: (item.sha || '').substring(0, 7),
            message: (item.commit?.message || '').split('\n')[0].substring(0, 72),
            timeAgo: formatRelativeTime(item.commit?.author?.date || item.commit?.committer?.date),
            url: item.html_url || `https://github.com/Shivam-io-afk/Portfolio/commit/${item.sha}`,
          }));

          setCommits(parsed);

          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), data: parsed })
            );
          } catch {}
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        // Fail silently as required
        setHasError(true);
      });
  }, []);

  if (hasError || commits.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 mt-8 pt-6 border-t border-[#d8dde6]/10">
      <div className="flex items-center gap-2 mb-3 text-[#ff5b1f] font-mono text-[11px] tracking-mono uppercase">
        <Terminal className="w-3.5 h-3.5" />
        <span>$ git log --oneline -3</span>
      </div>

      <div className="space-y-1.5 font-mono text-[11px] text-[#d8dde6]/70">
        {commits.map((c) => (
          <a
            key={c.sha}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-wrap items-center gap-2 hover:text-white transition-colors"
          >
            <GitCommit className="w-3 h-3 text-[#ff5b1f] shrink-0" />
            <span className="text-[#ff5b1f] font-bold group-hover:underline">{c.sha}</span>
            <span className="text-[#d8dde6]/85 group-hover:text-white truncate max-w-xl">
              {c.message}
            </span>
            <span className="text-[#d8dde6]/40 text-[10px]">({c.timeAgo})</span>
          </a>
        ))}
      </div>
    </div>
  );
};

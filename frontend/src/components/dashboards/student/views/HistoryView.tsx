import React, { useState, useEffect } from 'react';
import {
  History,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { studentApi } from '../../../../services/studentApi';
import type { RecommendationHistoryItem } from '../../../../services/studentApi';
import type { StudentNavTab } from '../StudentSidebar';

interface HistoryViewProps {
  onNavigateTab: (tab: StudentNavTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigateTab }) => {
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getRecommendationHistory();
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load recommendation history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 bg-void-surface rounded-md border border-border-default">
        <h3 className="font-display text-base font-semibold text-slate-100 flex items-center gap-2">
          <History className="h-4 w-4 text-accent-cyan" />
          <span>Recommendation History & Feedback Log</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Audit trail of past suggestions and your explicit feedback ratings used for local model calibration.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 rounded-md bg-void-surface border border-border-default animate-pulse p-4" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
          <History className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="font-display text-base font-semibold text-slate-200">
            No interaction history recorded
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Interact with the recommendations feed by clicking "Useful", "Irrelevant", or "Save" to build your personalized calibration history.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('recommendations')}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Open Recommendations
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {history.map((hist) => (
            <Card
              key={hist.id}
              className="p-4 border-border-default bg-void-surface flex items-center justify-between text-xs font-mono"
            >
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <Badge variant="shield" size="sm">
                    {hist.item_type.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400 truncate">
                    {hist.category}
                  </span>
                </div>
                <h4 className="font-display text-sm font-semibold text-slate-200 truncate">
                  {hist.title}
                </h4>
                <div className="text-[10px] text-slate-400">
                  Logged on {hist.timestamp.replace('T', ' ').split('.')[0]} UTC
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Recorded Verdict:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    hist.feedback === 'useful'
                      ? 'bg-status-verified/15 text-status-verified border border-status-verified/30'
                      : hist.feedback === 'not_relevant'
                      ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                      : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  }`}
                >
                  {hist.feedback === 'useful' && <ThumbsUp className="h-3.5 w-3.5" />}
                  {hist.feedback === 'not_relevant' && <ThumbsDown className="h-3.5 w-3.5" />}
                  {hist.feedback === 'saved' && <Bookmark className="h-3.5 w-3.5" />}
                  <span>{hist.feedback.replace('_', ' ')}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

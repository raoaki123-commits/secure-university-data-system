import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Activity,
  BarChart3,
  Layers,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { adminApi, type RecommendationMonitoringData } from '../../../../services/adminApi';

interface AdminRecommendationMonitorViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminRecommendationMonitorView: React.FC<AdminRecommendationMonitorViewProps> = ({
  onShowToast,
}) => {
  const [data, setData] = useState<RecommendationMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMonitoring = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getRecommendationMonitoring();
      if (res.monitoring) {
        setData(res.monitoring);
      }
    } catch {
      onShowToast('Failed to load recommendation telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchMonitoring();
  }, [fetchMonitoring]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-800/40 rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { total_feedback_events, feedback_counts, useful_ratio_percent, model_info, top_categories } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Recommendation Engine Telemetry
            </h1>
            <Badge variant="verified" size="sm">LIVE FEEDBACK LOOP</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real student interaction metrics, feedback utility ratio, and heuristic model parameters
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Interactions */}
        <Card className="p-5 border-border-default/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Feedback Signals</span>
            <div className="h-8 w-8 rounded-sm bg-brand-500/10 text-brand-300 border border-brand-500/30 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">
              {total_feedback_events}
            </span>
            <span className="text-[11px] font-mono text-slate-400">events logged</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 text-[11px] font-mono text-slate-400">
            Recorded anonymously under privacy filters
          </div>
        </Card>

        {/* Useful Ratio */}
        <Card className="p-5 border-border-default/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Utility Ratio</span>
            <div className="h-8 w-8 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-emerald-400">
              {useful_ratio_percent}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">marked useful</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 text-[11px] font-mono text-slate-400">
            {feedback_counts.useful} useful out of {total_feedback_events} total
          </div>
        </Card>

        {/* Saved Items */}
        <Card className="p-5 border-border-default/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Saved to Collection</span>
            <div className="h-8 w-8 rounded-sm bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 flex items-center justify-center">
              <Bookmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-100">
              {feedback_counts.saved}
            </span>
            <span className="text-[11px] font-mono text-slate-400">bookmarks</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border-default/50 text-[11px] font-mono text-slate-400">
            Direct user preference indicator
          </div>
        </Card>
      </div>

      {/* Model Specifications & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Architecture & Framework */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-400" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                Engine Specifications
              </h3>
            </div>
            <Badge variant="verified" size="sm">{model_info.deployment_status}</Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Active Deployment:</span>
              <span className="text-slate-100 font-semibold">{model_info.active_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-default/40">
              <span className="text-slate-400">Target Framework:</span>
              <span className="text-accent-cyan">{model_info.target_framework}</span>
            </div>
            <div className="py-1">
              <div className="text-slate-400 mb-1">Scoring Mechanics:</div>
              <div className="p-2.5 bg-void-surface border border-border-default rounded-sm text-slate-300 text-[11px]">
                {model_info.scoring_mechanism}
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback Signal Distribution */}
        <Card className="p-5 border-border-default/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                Feedback Signal Distribution
              </h3>
            </div>
            <Badge variant="neutral" size="sm">Real Counters</Badge>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ThumbsUp className="h-3 w-3" />
                  Useful
                </span>
                <span className="font-bold">{feedback_counts.useful}</span>
              </div>
              <div className="w-full bg-void-surface h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{
                    width: `${total_feedback_events > 0 ? (feedback_counts.useful / total_feedback_events) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <ThumbsDown className="h-3 w-3" />
                  Not Relevant
                </span>
                <span className="font-bold">{feedback_counts.irrelevant}</span>
              </div>
              <div className="w-full bg-void-surface h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{
                    width: `${total_feedback_events > 0 ? (feedback_counts.irrelevant / total_feedback_events) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5 text-accent-cyan">
                  <Bookmark className="h-3 w-3" />
                  Saved to Personal Enclave
                </span>
                <span className="font-bold">{feedback_counts.saved}</span>
              </div>
              <div className="w-full bg-void-surface h-2 rounded-full overflow-hidden">
                <div
                  className="bg-accent-cyan h-full rounded-full"
                  style={{
                    width: `${total_feedback_events > 0 ? (feedback_counts.saved / total_feedback_events) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Categories In Feedback */}
      <Card className="p-5 border-border-default/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Top Interacted Academic Categories
            </h3>
          </div>
          <Badge variant="neutral" size="sm">Aggregation</Badge>
        </div>

        {top_categories.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-slate-500">
            No category interactions recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {top_categories.map((cat, idx) => (
              <div key={idx} className="p-3 bg-void-surface border border-border-default rounded-sm font-mono text-xs">
                <div className="text-slate-400 text-[11px]">Rank #{idx + 1}</div>
                <div className="font-semibold text-slate-200 mt-1 truncate">{cat.category}</div>
                <div className="text-[11px] text-accent-cyan mt-1">{cat.count} interactions</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

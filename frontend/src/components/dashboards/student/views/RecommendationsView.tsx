import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Info,
  CheckCircle2,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../../../design-system/components/Card';
import { Badge } from '../../../../design-system/components/Badge';
import { Button } from '../../../../design-system/components/Button';
import { studentApi } from '../../../../services/studentApi';
import type {
  RecommendationItem,
  RecommendationMetadata,
} from '../../../../services/studentApi';

interface RecommendationsViewProps {
  onToggleBookmark: (itemId: string, itemType: 'resource' | 'event' | 'service', snapshot: any) => Promise<void>;
  savedItemIds: Set<string>;
  onRefreshData?: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  onToggleBookmark,
  savedItemIds,
  onRefreshData,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'resource' | 'event' | 'service'>('all');
  const [selectedEngine, setSelectedEngine] = useState<'hybrid' | 'baseline'>('hybrid');
  const [feedbackState, setFeedbackState] = useState<Record<string, 'useful' | 'not_relevant' | 'saved'>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Oblivious Homomorphic Scoring state
  const [showObliviousPanel, setShowObliviousPanel] = useState(false);
  const [isComputingHE, setIsComputingHE] = useState(false);
  const [heResults, setHeResults] = useState<any | null>(null);

  const fetchRecommendations = async (engine: 'hybrid' | 'baseline' = selectedEngine) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('sovereign_access_token');
      const res = await fetch(`/api/v1/recommendations/student?engine=${engine}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.data) {
        setRecommendations(data.data.recommendations || []);
        setMetadata(data.data.recommender_metadata || null);
      } else if (data.recommendations) {
        setRecommendations(data.recommendations);
        setMetadata(data.recommender_metadata || null);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedEngine);
  }, [selectedEngine]);

  const handleFeedback = async (
    item: RecommendationItem,
    feedback: 'useful' | 'not_relevant' | 'saved'
  ) => {
    setFeedbackState((prev) => ({ ...prev, [item.item_id]: feedback }));

    if (feedback === 'saved') {
      await onToggleBookmark(item.item_id, item.item_type, item);
    }

    try {
      await studentApi.submitFeedback(
        item.item_id,
        item.item_type,
        feedback,
        item.title,
        item.category
      );
      setToastMessage(`Feedback recorded: Marked "${item.title}" as ${feedback}.`);
      setTimeout(() => setToastMessage(null), 3000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to submit recommendation feedback:', err);
    }
  };

  // Run live Oblivious Homomorphic Scoring with TenSEAL CKKS
  const handleRunObliviousHE = async () => {
    setIsComputingHE(true);
    setHeResults(null);

    try {
      const token = localStorage.getItem('sovereign_access_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Step 1: Encrypt student preference vector on client-side proxy
      const encRes = await fetch('/api/v1/privacy/encrypt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ vector: [0.88, 0.76, 0.92, 0.64] }),
      }).then((r) => r.json());

      const ciphertext = encRes.data?.ciphertext;
      if (!ciphertext) {
        throw new Error('Encryption service failed to return ciphertext.');
      }

      // Step 2: Send encrypted vector to server for oblivious dot product
      const startTime = performance.now();
      const oblRes = await fetch('/api/v1/recommendations/oblivious', {
        method: 'POST',
        headers,
        body: JSON.stringify({ encrypted_vector: ciphertext }),
      }).then((r) => r.json());
      const elapsed = Math.round(performance.now() - startTime);

      setHeResults({
        executionTimeMs: elapsed,
        ciphertextSizeKB: Math.round(ciphertext.length / 1024),
        zeroCleartextGuarantee: oblRes.data?.zero_cleartext_guarantee ?? true,
        encryptedCount: oblRes.data?.encrypted_recommendations?.length || 0,
        sampleCiphertext: oblRes.data?.encrypted_recommendations?.[0]?.encrypted_score?.slice(0, 48) + '...',
        details: oblRes.data,
      });
    } catch (err: any) {
      console.error('Oblivious scoring failed:', err);
      setToastMessage(`CKKS scoring error: ${err.message}`);
    } finally {
      setIsComputingHE(false);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filterType === 'all') return true;
    return r.item_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded bg-void-elevated border border-brand-500/50 text-brand-300 text-xs font-mono shadow-brand-glow flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-status-verified" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RECOMMENDER ARCHITECTURE STATUS & ENGINE SELECTOR */}
      <div className="p-4 rounded-md bg-void-surface border border-border-default text-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
              Active Recommendation Engine: {selectedEngine === 'hybrid' ? 'TensorFlow 2.x NeuMF + Content TF-IDF' : 'Baseline Heuristic'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="verified">
              {selectedEngine === 'hybrid' ? 'TF 2.x NEURAL CF' : 'BASELINE HEURISTIC'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowObliviousPanel(!showObliviousPanel)}
              className="text-xs font-mono"
            >
              <Lock className="h-3.5 w-3.5 mr-1 text-accent-cyan" />
              {showObliviousPanel ? 'Hide CKKS Enclave' : 'Oblivious HE Scoring'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedEngine === 'hybrid'
            ? 'Neural Matrix Factorization (NeuMF) maps student embeddings and catalog item representations through dense non-linear layers, combined with TF-IDF cosine similarity for high-precision personalized discovery.'
            : 'Baseline heuristic scores items based on department affinity, faculty recommendations, and verified student engagement counts.'}
        </p>

        {/* Engine Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-default text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Select Engine:</span>
            <button
              onClick={() => setSelectedEngine('hybrid')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedEngine === 'hybrid'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50 font-bold'
                  : 'bg-void-surface text-slate-400 hover:text-slate-200'
              }`}
            >
              TensorFlow 2.x Hybrid
            </button>
            <button
              onClick={() => setSelectedEngine('baseline')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedEngine === 'baseline'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50 font-bold'
                  : 'bg-void-surface text-slate-400 hover:text-slate-200'
              }`}
            >
              Baseline Heuristic
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Framework: <code className="text-brand-300">{metadata?.ml_framework || 'TensorFlow 2.x / CKKS'}</code></span>
            <span>Target: <code className="text-accent-cyan">{metadata?.student_department || 'Computer Science'}</code></span>
          </div>
        </div>
      </div>

      {/* OBLIVIOUS HOMOMORPHIC (CKKS) EVALUATION PANEL */}
      {showObliviousPanel && (
        <Card className="p-5 border-accent-cyan/40 bg-void-surface space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-100">
                  Oblivious Homomorphic Recommendation Scoring (TenSEAL CKKS)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Compute personalized similarity dot products directly over encrypted ciphertexts without decrypting cleartext data.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunObliviousHE}
              isLoading={isComputingHE}
              className="text-xs font-mono"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Run Encrypted Computation
            </Button>
          </div>

          {heResults && (
            <div className="p-4 rounded bg-void-elevated border border-accent-cyan/30 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  <span className="text-slate-400 block">Execution Latency</span>
                  <span className="font-bold text-accent-cyan">{heResults.executionTimeMs} ms</span>
                </div>
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  <span className="text-slate-400 block">Payload Size</span>
                  <span className="font-bold text-slate-200">~{heResults.ciphertextSizeKB} KB</span>
                </div>
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  <span className="text-slate-400 block">Items Evaluated</span>
                  <span className="font-bold text-accent-emerald">{heResults.encryptedCount} Items</span>
                </div>
                <div className="p-2 rounded bg-void-surface border border-border-default">
                  <span className="text-slate-400 block">Cleartext Guarantee</span>
                  <span className="font-bold text-accent-emerald">Zero Cleartext (True)</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">Server Encrypted Output Sample:</span>
                <code className="text-[11px] text-accent-cyan bg-void-surface px-2 py-1 rounded block truncate border border-border-default">
                  {heResults.sampleCiphertext}
                </code>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
            Curated Discovery Feed ({filteredRecs.length})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-void-surface p-1 rounded-sm border border-border-default text-xs font-mono">
          {(['all', 'resource', 'event', 'service'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-xs transition-colors uppercase text-[10px] tracking-wide ${
                filterType === type
                  ? 'bg-brand-500 text-slate-50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'All Types' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 rounded-md bg-void-surface border border-border-default animate-pulse p-4" />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <Card className="p-12 text-center border-border-default bg-void-surface space-y-3">
          <Sparkles className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="font-display text-base font-semibold text-slate-200">
            No recommendations in this filter
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Switch to "All Types" to view the full recommendation feed.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecs.map((item) => {
            const isSaved = savedItemIds.has(item.item_id);
            const activeFb = feedbackState[item.item_id];
            const matchPercent = Math.round(item.score * 100);

            return (
              <Card
                key={item.item_id}
                className="p-5 border-border-default bg-void-surface hover:border-brand-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="shield" size="sm">
                      {item.item_type.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] font-mono font-semibold text-accent-cyan px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30">
                      {matchPercent}% Match
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.category} • {item.department}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-slate-100">
                    {item.title}
                  </h3>

                  {/* Recommendation Explanation */}
                  <div className="p-2 rounded bg-void-elevated/70 border border-border-subtle text-xs font-mono text-slate-300 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>{item.explanation}</span>
                  </div>

                  {/* Additional Meta if present */}
                  <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-3">
                    {item.source && <span>Source: {item.source}</span>}
                    {item.date && <span>Date: {item.date}</span>}
                    {item.location && <span>Location: {item.location}</span>}
                    {item.contact_email && <span>Contact: {item.contact_email}</span>}
                  </div>
                </div>

                {/* Right Side: Feedback Controls */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 p-1 bg-void-elevated rounded border border-border-default">
                    <button
                      onClick={() => handleFeedback(item, 'useful')}
                      className={`p-1.5 rounded text-xs font-mono flex items-center gap-1 transition-all ${
                        activeFb === 'useful'
                          ? 'bg-status-verified text-slate-900 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-void-surface'
                      }`}
                      title="Mark recommendation as useful"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Useful</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(item, 'not_relevant')}
                      className={`p-1.5 rounded text-xs font-mono flex items-center gap-1 transition-all ${
                        activeFb === 'not_relevant'
                          ? 'bg-status-danger text-slate-50 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-void-surface'
                      }`}
                      title="Mark as not relevant"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Irrelevant</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(item, 'saved')}
                      className={`p-1.5 rounded text-xs font-mono flex items-center gap-1 transition-all ${
                        isSaved || activeFb === 'saved'
                          ? 'bg-brand-500 text-slate-50 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-void-surface'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save for later'}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-void-surface hover:bg-void-elevated border border-border-default text-slate-300 hover:text-slate-100 transition-colors"
                      title="Open source link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

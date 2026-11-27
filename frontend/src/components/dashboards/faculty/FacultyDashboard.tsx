import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { RbacLiveTester } from '../RbacLiveTester';
import {
  GraduationCap,
  UploadCloud,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  MapPin,
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigateHome: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigateHome }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'events' | 'recommendations' | 'rbac'>('overview');

  // Resource Form State
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCategory, setResCategory] = useState('Computer Science');
  const [resFormat, setResFormat] = useState('PDF');
  const [resUrl, setResUrl] = useState('');
  const [resTags, setResTags] = useState('');
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);
  const [resSuccessMsg, setResSuccessMsg] = useState<string | null>(null);
  const [resErrorMsg, setResErrorMsg] = useState<string | null>(null);

  // Event Form State
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evCategory, setEvCategory] = useState('Academic Conferences');
  const [evDate, setEvDate] = useState('2026-12-01');
  const [evTime, setEvTime] = useState('15:00 - 16:30');
  const [evLocation, setEvLocation] = useState('Faculty Hall 301');
  const [evTags, setEvTags] = useState('Colloquium, Research');
  const [isSubmittingEv, setIsSubmittingEv] = useState(false);
  const [evSuccessMsg, setEvSuccessMsg] = useState<string | null>(null);
  const [evErrorMsg, setEvErrorMsg] = useState<string | null>(null);

  // Published resources list (local + fetched)
  const [recentResources, setRecentResources] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Fetch initial resources and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('sovereign_access_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [rRes, eRes] = await Promise.all([
          fetch('/api/v1/resources?limit=6', { headers }).then((r) => r.json()),
          fetch('/api/v1/events?limit=4', { headers }).then((r) => r.json()),
        ]);

        if (rRes.resources) setRecentResources(rRes.resources);
        if (eRes.events) setRecentEvents(eRes.events);
      } catch (err) {
        console.error('Failed to load initial faculty items:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch recommendations when tab is clicked
  useEffect(() => {
    if (activeTab === 'recommendations' && recs.length === 0) {
      setIsLoadingRecs(true);
      const token = localStorage.getItem('sovereign_access_token');
      fetch('/api/v1/recommendations/student?engine=hybrid', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.recommendations) setRecs(data.recommendations);
        })
        .catch((err) => console.error('Failed to fetch recommendations:', err))
        .finally(() => setIsLoadingRecs(false));
    }
  }, [activeTab, recs.length]);

  // Submit Resource Handler
  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRes(true);
    setResSuccessMsg(null);
    setResErrorMsg(null);

    try {
      const token = localStorage.getItem('sovereign_access_token');
      const tagsArray = resTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: resTitle,
          description: resDesc,
          category: resCategory,
          department: user?.department || 'Computer Science',
          format: resFormat,
          url: resUrl || 'https://library.university.edu/resources',
          tags: tagsArray.length > 0 ? tagsArray : ['Faculty Verified', 'Course Material'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResSuccessMsg(`Resource "${resTitle}" successfully published and indexed!`);
        if (data.data) {
          setRecentResources((prev) => [data.data, ...prev]);
        }
        setResTitle('');
        setResDesc('');
        setResUrl('');
        setResTags('');
      } else {
        setResErrorMsg(data.message || data.error || 'Failed to publish resource.');
      }
    } catch {
      setResErrorMsg('Network error connecting to backend service.');
    } finally {
      setIsSubmittingRes(false);
    }
  };

  // Submit Event Handler
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEv(true);
    setEvSuccessMsg(null);
    setEvErrorMsg(null);

    try {
      const token = localStorage.getItem('sovereign_access_token');
      const tagsArray = evTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: evTitle,
          description: evDesc,
          category: evCategory,
          date: evDate,
          time: evTime,
          location: evLocation,
          tags: tagsArray.length > 0 ? tagsArray : ['Colloquium', 'Faculty Lecture'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvSuccessMsg(`Colloquium "${evTitle}" successfully scheduled!`);
        if (data.data) {
          setRecentEvents((prev) => [data.data, ...prev]);
        }
        setEvTitle('');
        setEvDesc('');
      } else {
        setEvErrorMsg(data.message || data.error || 'Failed to schedule event.');
      }
    } catch {
      setEvErrorMsg('Network error connecting to backend service.');
    } finally {
      setIsSubmittingEv(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border-default bg-void-surface/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm font-bold text-slate-100 tracking-tight">
                Faculty Academic & Advising Portal
              </h1>
              <Badge variant="verified">FACULTY PRIVILEGES</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.name || 'Faculty Member'} · {user?.department || 'Academic Division'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onNavigateHome}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await logout();
              onNavigateHome();
            }}
          >
            <LogOut className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Logout
          </Button>
        </div>
      </header>

      {/* Nav Tabs */}
      <div className="border-b border-border-default bg-void-surface/40 px-6">
        <div className="flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'overview'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Advising
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Contribute Resources
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Colloquia & Events
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
            Scholarly Recommendations
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'rbac'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent-violet" />
            RBAC & Security
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Department Catalog</span>
                  <BookOpen className="h-4 w-4 text-brand-400" />
                </div>
                <div className="text-2xl font-bold font-display text-slate-100">{recentResources.length}</div>
                <p className="text-[11px] text-slate-400">Published instructional monographs</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Scheduled Seminars</span>
                  <Calendar className="h-4 w-4 text-accent-cyan" />
                </div>
                <div className="text-2xl font-bold font-display text-slate-100">{recentEvents.length}</div>
                <p className="text-[11px] text-slate-400">Department colloquia online</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Cryptographic Enclave</span>
                  <ShieldCheck className="h-4 w-4 text-accent-emerald" />
                </div>
                <div className="text-sm font-semibold font-mono text-accent-emerald">CKKS + MPC Active</div>
                <p className="text-[11px] text-slate-400">Student privacy fully protected</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Role Authorization</span>
                  <Badge variant="verified">Faculty Verified</Badge>
                </div>
                <div className="text-sm font-semibold font-mono text-slate-200">Tier 2 Publishing</div>
                <p className="text-[11px] text-slate-400">Backend RBAC verified</p>
              </Card>
            </div>

            {/* Quick Actions & Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-brand-400" />
                    Contribute Course Materials
                  </h3>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('resources')}>
                    Open Form
                  </Button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Publish lecture notes, reading lists, research papers, and lab manuals directly to the university recommendation index. Resources are vectorized and recommended to relevant students according to privacy-preserving policies.
                </p>
                <div className="space-y-2">
                  {recentResources.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 rounded bg-void-surface border border-border-default flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.category} · {item.format}</div>
                      </div>
                      <Badge variant="neutral">{item.status || 'Active'}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent-cyan" />
                    Department Colloquia & Seminars
                  </h3>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('events')}>
                    Schedule Seminar
                  </Button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Host academic conferences, guest faculty symposiums, and interdisciplinary workshops. Registered events automatically surface to student feeds.
                </p>
                <div className="space-y-2">
                  {recentEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-3 rounded bg-void-surface border border-border-default flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{ev.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{ev.date}</span>
                          <span>·</span>
                          <span>{ev.location}</span>
                        </div>
                      </div>
                      <Badge variant="verified">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* CONTRIBUTE RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-5 space-y-4 border-brand-500/30">
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-brand-400" />
                  Publish Academic Resource
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Faculty submissions are directly added to the university catalog and fed to the TensorFlow recommendation model.
                </p>

                {resSuccessMsg && (
                  <div className="p-3 rounded bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{resSuccessMsg}</span>
                  </div>
                )}

                {resErrorMsg && (
                  <div className="p-3 rounded bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{resErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePublishResource} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Resource Title *</label>
                    <Input
                      required
                      placeholder="e.g., Advanced Quantum Algorithms Monograph"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                      placeholder="Summary of theoretical concepts, chapters, and prerequisite knowledge..."
                      value={resDesc}
                      onChange={(e) => setResDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Category</label>
                      <select
                        className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                        value={resCategory}
                        onChange={(e) => setResCategory(e.target.value)}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Engineering">Engineering</option>
                        <option value="study-materials">Study Materials</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Format</label>
                      <select
                        className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                        value={resFormat}
                        onChange={(e) => setResFormat(e.target.value)}
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="Lecture Notes">Lecture Notes</option>
                        <option value="Jupyter Notebook">Jupyter Notebook</option>
                        <option value="Interactive Lab">Interactive Lab</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Scholarly URL</label>
                    <Input
                      placeholder="https://library.university.edu/monograph.pdf"
                      value={resUrl}
                      onChange={(e) => setResUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Topic Tags (comma-separated)</label>
                    <Input
                      placeholder="Algorithms, Complexity, Quantum"
                      value={resTags}
                      onChange={(e) => setResTags(e.target.value)}
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" isLoading={isSubmittingRes}>
                    Publish to Recommendation Engine
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-100">
                  Published Materials Directory ({recentResources.length})
                </h3>
                <Badge variant="verified">Live Index</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentResources.map((item) => (
                  <Card key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{item.title}</div>
                      <Badge variant="neutral">{item.format || 'PDF'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-border-default">
                      <span>{item.category}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-300 hover:text-brand-200 flex items-center gap-1"
                        >
                          View Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COLLOQUIA & EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-5 space-y-4 border-accent-cyan/30">
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent-cyan" />
                  Schedule Department Colloquium
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Schedule research talks, thesis defenses, guest academic lectures, or symposiums.
                </p>

                {evSuccessMsg && (
                  <div className="p-3 rounded bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{evSuccessMsg}</span>
                  </div>
                )}

                {evErrorMsg && (
                  <div className="p-3 rounded bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{evErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleScheduleEvent} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Colloquium Title *</label>
                    <Input
                      required
                      placeholder="e.g., Departmental Theory Seminar"
                      value={evTitle}
                      onChange={(e) => setEvTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                      placeholder="Speaker bio, abstract, relevant citations..."
                      value={evDesc}
                      onChange={(e) => setEvDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Date *</label>
                      <Input
                        type="date"
                        required
                        value={evDate}
                        onChange={(e) => setEvDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Time</label>
                      <Input
                        placeholder="16:00 - 17:30"
                        value={evTime}
                        onChange={(e) => setEvTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Category</label>
                      <select
                        className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                        value={evCategory}
                        onChange={(e) => setEvCategory(e.target.value)}
                      >
                        <option value="Academic Conferences">Academic Conferences</option>
                        <option value="Department Colloquia">Department Colloquia</option>
                        <option value="Research Symposia">Research Symposia</option>
                        <option value="Seminars">Seminars</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Campus Location</label>
                      <Input
                        placeholder="Turing Hall 101 / Zoom"
                        value={evLocation}
                        onChange={(e) => setEvLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Tags</label>
                    <Input
                      placeholder="Colloquium, Research, Quantum"
                      value={evTags}
                      onChange={(e) => setEvTags(e.target.value)}
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" isLoading={isSubmittingEv}>
                    Publish Event
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-100">
                  Campus Events Schedule ({recentEvents.length})
                </h3>
                <Badge variant="verified">Live Calendar</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentEvents.map((ev) => (
                  <Card key={ev.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{ev.title}</div>
                      <Badge variant="verified">{ev.category || 'Seminar'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                    <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-border-default">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                        <span>{ev.date} · {ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-brand-400" />
                        <span>{ev.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCHOLARLY RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  Personalized Academic & Research Recommendations
                </h3>
                <p className="text-xs text-slate-400">
                  Ranked by TensorFlow 2.x Neural Matrix Factorization + Content Vector Cosine Similarity
                </p>
              </div>
              <Badge variant="verified">TensorFlow 2.x NeuMF</Badge>
            </div>

            {isLoadingRecs ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono">
                Computing oblivious homomorphic dot products and neural embeddings...
              </div>
            ) : recs.length === 0 ? (
              <Card className="p-8 text-center space-y-2">
                <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No recommendation signals available yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recs.map((item, idx) => (
                  <Card key={idx} className="p-4 space-y-3 border-brand-500/20">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{item.title}</div>
                      <Badge variant="verified">{(item.score * 100).toFixed(0)}% match</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.explanation || 'Curated based on departmental academic affinity and peer research signals.'}
                    </p>
                    <div className="text-[11px] text-brand-300 font-mono">
                      Category: {item.category}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RBAC & SECURITY TAB */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            <Card className="p-5 space-y-3 border-accent-violet/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-violet" />
                <h3 className="font-display text-sm font-bold text-slate-100">
                  Faculty Privilege Matrix & Security Architecture
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As a verified member of the university faculty, your authenticated session token is cryptographically signed and verified by the Flask backend on every invocation. You have read and publish privileges for academic resources and colloquium events. Under the Principle of Least Privilege, administrative actions (such as user suspension or master system configuration) are strictly blocked (403 Forbidden).
              </p>
            </Card>

            <RbacLiveTester />
          </div>
        )}
      </main>
    </div>
  );
};

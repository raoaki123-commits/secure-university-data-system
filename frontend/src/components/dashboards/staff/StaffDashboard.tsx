import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { RbacLiveTester } from '../RbacLiveTester';
import {
  Briefcase,
  HeartHandshake,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Mail,
  Clock,
  MapPin,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigateHome: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigateHome }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'events' | 'recommendations' | 'rbac'>('overview');

  // Service Form State
  const [srvName, setSrvName] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvCategory, setSrvCategory] = useState('Health & Wellness');
  const [srvEmail, setSrvEmail] = useState('');
  const [srvLocation, setSrvLocation] = useState('Campus Center Room 102');
  const [srvHours, setSrvHours] = useState('Mon-Fri: 09:00 - 17:00');
  const [srvTier, setSrvTier] = useState('Confidential');
  const [srvTags, setSrvTags] = useState('Student Support, Mental Health, Walk-in');
  const [isSubmittingSrv, setIsSubmittingSrv] = useState(false);
  const [srvSuccessMsg, setSrvSuccessMsg] = useState<string | null>(null);
  const [srvErrorMsg, setSrvErrorMsg] = useState<string | null>(null);

  // Event Form State
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evCategory, setEvCategory] = useState('Campus Life');
  const [evDate, setEvDate] = useState('2026-12-05');
  const [evTime, setEvTime] = useState('10:00 - 15:00');
  const [evLocation, setEvLocation] = useState('Student Union Plaza');
  const [evTags, setEvTags] = useState('Orientation, Wellness Fair');
  const [isSubmittingEv, setIsSubmittingEv] = useState(false);
  const [evSuccessMsg, setEvSuccessMsg] = useState<string | null>(null);
  const [evErrorMsg, setEvErrorMsg] = useState<string | null>(null);

  // Data lists
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('sovereign_access_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [sRes, eRes] = await Promise.all([
          fetch('/api/v1/services', { headers }).then((r) => r.json()),
          fetch('/api/v1/events?limit=4', { headers }).then((r) => r.json()),
        ]);

        if (sRes.services) setServicesList(sRes.services);
        if (eRes.events) setEventsList(eRes.events);
      } catch (err) {
        console.error('Failed to load initial staff items:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch recommendations on demand
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

  // Submit Service Handler
  const handleRegisterService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSrv(true);
    setSrvSuccessMsg(null);
    setSrvErrorMsg(null);

    try {
      const token = localStorage.getItem('sovereign_access_token');
      const tagsArray = srvTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: srvName,
          description: srvDesc,
          category: srvCategory,
          contact_email: srvEmail || 'support@university.edu',
          location: srvLocation,
          hours: srvHours,
          confidentiality_tier: srvTier,
          tags: tagsArray.length > 0 ? tagsArray : ['Campus Service', 'Student Support'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSrvSuccessMsg(`Service "${srvName}" registered successfully!`);
        if (data.data) {
          setServicesList((prev) => [data.data, ...prev]);
        }
        setSrvName('');
        setSrvDesc('');
        setSrvEmail('');
      } else {
        setSrvErrorMsg(data.message || data.error || 'Failed to register service.');
      }
    } catch {
      setSrvErrorMsg('Network error connecting to backend service.');
    } finally {
      setIsSubmittingSrv(false);
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
          tags: tagsArray.length > 0 ? tagsArray : ['Staff Organized', 'Campus Event'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvSuccessMsg(`Campus event "${evTitle}" scheduled successfully!`);
        if (data.data) {
          setEventsList((prev) => [data.data, ...prev]);
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
          <div className="h-9 w-9 rounded-lg bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm font-bold text-slate-100 tracking-tight">
                Staff Operations & Student Support Portal
              </h1>
              <Badge variant="verified">STAFF PRIVILEGES</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.name || 'Staff Member'} · {user?.department || 'Student Services Division'}
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
            Operations Overview
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            Register Campus Services
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
            Campus Events & Workshops
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
            Student Welfare Signals
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Registered Services</span>
                  <HeartHandshake className="h-4 w-4 text-accent-amber" />
                </div>
                <div className="text-2xl font-bold font-display text-slate-100">{servicesList.length}</div>
                <p className="text-[11px] text-slate-400">Active campus student welfare nodes</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Operations Events</span>
                  <Calendar className="h-4 w-4 text-accent-cyan" />
                </div>
                <div className="text-2xl font-bold font-display text-slate-100">{eventsList.length}</div>
                <p className="text-[11px] text-slate-400">Campus workshops scheduled</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Confidentiality Engine</span>
                  <ShieldCheck className="h-4 w-4 text-accent-emerald" />
                </div>
                <div className="text-sm font-semibold font-mono text-accent-emerald">Zero-Leakage MPC</div>
                <p className="text-[11px] text-slate-400">Confidential service routing</p>
              </Card>

              <Card className="p-4 space-y-2 border-border-default">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Role Authorization</span>
                  <Badge variant="verified">Staff Verified</Badge>
                </div>
                <div className="text-sm font-semibold font-mono text-slate-200">Tier 2 Operations</div>
                <p className="text-[11px] text-slate-400">Backend RBAC verified</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-accent-amber" />
                    Register Student Support Services
                  </h3>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('services')}>
                    New Service
                  </Button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Register new student counseling clinics, financial aid drop-in hours, accessibility accommodations, or international student advisory desks.
                </p>
                <div className="space-y-2">
                  {servicesList.slice(0, 3).map((srv) => (
                    <div key={srv.id} className="p-3 rounded bg-void-surface border border-border-default flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{srv.name}</div>
                        <div className="text-[11px] text-slate-400">{srv.category} · {srv.confidentiality_tier || 'Confidential'}</div>
                      </div>
                      <Badge variant="verified">Active</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent-cyan" />
                    Campus Life & Operations Events
                  </h3>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('events')}>
                    Schedule Event
                  </Button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Host campus career fairs, student wellness workshops, orientation tours, and administrative town halls.
                </p>
                <div className="space-y-2">
                  {eventsList.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-3 rounded bg-void-surface border border-border-default flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{ev.title}</div>
                        <div className="text-[11px] text-slate-400">{ev.date} · {ev.location}</div>
                      </div>
                      <Badge variant="verified">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* REGISTER SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-5 space-y-4 border-accent-amber/30">
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-accent-amber" />
                  Register University Service
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Staff submissions are indexed immediately and surfaced to students based on confidential preference matching.
                </p>

                {srvSuccessMsg && (
                  <div className="p-3 rounded bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{srvSuccessMsg}</span>
                  </div>
                )}

                {srvErrorMsg && (
                  <div className="p-3 rounded bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{srvErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterService} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Service Name *</label>
                    <Input
                      required
                      placeholder="e.g., Student Mental Health Emergency Clinic"
                      value={srvName}
                      onChange={(e) => setSrvName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                      placeholder="Service scope, confidential intake process, walk-in availability..."
                      value={srvDesc}
                      onChange={(e) => setSrvDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Category</label>
                      <select
                        className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                        value={srvCategory}
                        onChange={(e) => setSrvCategory(e.target.value)}
                      >
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Academic Support">Academic Support</option>
                        <option value="Career Services">Career Services</option>
                        <option value="Financial & Housing">Financial & Housing</option>
                        <option value="Accessibility Services">Accessibility Services</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Confidentiality Tier</label>
                      <select
                        className="w-full bg-void-surface border border-border-default rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
                        value={srvTier}
                        onChange={(e) => setSrvTier(e.target.value)}
                      >
                        <option value="Strictly Confidential">Strictly Confidential</option>
                        <option value="Confidential">Confidential</option>
                        <option value="Standard Student Record">Standard Student Record</option>
                        <option value="Public Directory">Public Directory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Contact Email</label>
                    <Input
                      placeholder="counseling-walkin@university.edu"
                      value={srvEmail}
                      onChange={(e) => setSrvEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Campus Location</label>
                      <Input
                        placeholder="Health Sciences West 204"
                        value={srvLocation}
                        onChange={(e) => setSrvLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Operating Hours</label>
                      <Input
                        placeholder="Mon-Fri: 08:30 - 18:00"
                        value={srvHours}
                        onChange={(e) => setSrvHours(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Tags</label>
                    <Input
                      placeholder="Mental Health, Crisis Support, Confidential"
                      value={srvTags}
                      onChange={(e) => setSrvTags(e.target.value)}
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" isLoading={isSubmittingSrv}>
                    Register Service
                  </Button>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-100">
                  Registered Campus Services Registry ({servicesList.length})
                </h3>
                <Badge variant="verified">Live Index</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesList.map((srv) => (
                  <Card key={srv.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{srv.name}</div>
                      <Badge variant="verified">{srv.confidentiality_tier || 'Confidential'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                    <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-border-default">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-400" />
                        <span>{srv.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-accent-cyan" />
                        <span>{srv.hours}</span>
                      </div>
                      {srv.contact_email && (
                        <div className="flex items-center gap-1.5 text-accent-amber">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{srv.contact_email}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-5 space-y-4 border-accent-cyan/30">
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent-cyan" />
                  Schedule Campus Event
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Host career fairs, health screening drives, and campus workshops.
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
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Event Title *</label>
                    <Input
                      required
                      placeholder="e.g., Campus Fall Wellness Fair"
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
                      placeholder="Event details, target attendees, registration instructions..."
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
                        placeholder="10:00 - 15:00"
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
                        <option value="Campus Life">Campus Life</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Career Services">Career Services</option>
                        <option value="Orientation & Outreach">Orientation & Outreach</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-slate-300 block mb-1">Location</label>
                      <Input
                        placeholder="Student Union Plaza"
                        value={evLocation}
                        onChange={(e) => setEvLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Tags</label>
                    <Input
                      placeholder="Wellness, Student Life, Free Food"
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
                  Campus Events Schedule ({eventsList.length})
                </h3>
                <Badge variant="verified">Live Calendar</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsList.map((ev) => (
                  <Card key={ev.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{ev.title}</div>
                      <Badge variant="verified">{ev.category || 'Event'}</Badge>
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

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  Student Welfare Signals & Program Recommendations
                </h3>
                <p className="text-xs text-slate-400">
                  Powered by privacy-preserving collaborative filtering & affinity clustering
                </p>
              </div>
              <Badge variant="verified">TensorFlow 2.x NeuMF</Badge>
            </div>

            {isLoadingRecs ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono">
                Loading campus recommendation signals...
              </div>
            ) : recs.length === 0 ? (
              <Card className="p-8 text-center space-y-2">
                <HeartHandshake className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No recommendation signals available yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recs.map((item, idx) => (
                  <Card key={idx} className="p-4 space-y-3 border-accent-amber/20">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-100">{item.title}</div>
                      <Badge variant="verified">{(item.score * 100).toFixed(0)}% affinity</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.explanation || 'Curated based on campus operational affinity and peer interaction patterns.'}
                    </p>
                    <div className="text-[11px] text-accent-amber font-mono">
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
                  Staff Privilege Matrix & Security Architecture
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                As a verified member of university administrative and operations staff, your token grants authorized write access to university services and campus events. Administrative maintenance actions (such as user suspension or server secrets inspection) are strictly rejected with 403 Forbidden.
              </p>
            </Card>

            <RbacLiveTester />
          </div>
        )}
      </main>
    </div>
  );
};

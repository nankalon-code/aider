import { useEffect, useState } from 'react';
import { UploadCloud, FileSpreadsheet, LayoutDashboard, Users, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './index.css';

interface OverviewMetrics {
  totalEnrollees: number;
  activeEnrollees: number;
  totalGrievances: number;
  resolvedGrievances: number;
}

interface Enrollee {
  id: number;
  name: string;
  centre: string;
  status: string;
  riskScore: 'Low' | 'Medium' | 'High';
}

interface Grievance {
  id: number;
  reporterName: string;
  category: string;
  status: string;
  centre: string;
}

const PIE_COLORS = ['#15803D', '#D97706', '#B91C1C']; // Low, Medium, High

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollees' | 'grievances'>('overview');
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');

  // Fetch real data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, enrolleesRes, grievancesRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/overview'),
          fetch('http://localhost:8000/api/dashboard/enrollees'),
          fetch('http://localhost:8000/api/dashboard/grievances')
        ]);
        
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (enrolleesRes.ok) setEnrollees(await enrolleesRes.json());
        if (grievancesRes.ok) setGrievances(await grievancesRes.json());
      } catch (err) {
        console.error("Failed to fetch from backend API", err);
        // Fallback mock data if API is down
        setMetrics({ totalEnrollees: 1245, activeEnrollees: 890, totalGrievances: 142, resolvedGrievances: 105 });
        setEnrollees([
          { id: 1, name: 'Asha Devi', centre: 'Okhla Ph-1', status: 'Active', riskScore: 'High' },
          { id: 2, name: 'Sunita M.', centre: 'Tiruppur Hub', status: 'Active', riskScore: 'Low' },
          { id: 3, name: 'Ramesh K.', centre: 'Peenya Industrial', status: 'Dropped Out', riskScore: 'Medium' },
        ]);
        setGrievances([
          { id: 1, reporterName: 'Karthik R.', category: 'Unpaid Wages', status: 'Open', centre: 'Okhla Ph-1' },
          { id: 2, reporterName: 'Meena T.', category: 'Verbal Abuse', status: 'Resolved', centre: 'Tiruppur Hub' },
        ]);
      }
    };
    
    fetchData();
  }, []);

  const handleUpload = () => {
    setUploadState('uploading');
    setTimeout(() => {
      setUploadState('success');
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadState('idle');
      }, 1500);
    }, 2000);
  };

  const getStatusDot = (risk: string) => {
    switch(risk) {
      case 'High': return 'red';
      case 'Medium': return 'yellow';
      default: return 'green';
    }
  };

  // Data transformations for charts
  const riskDistribution = [
    { name: 'Low Risk', value: enrollees.filter(e => e.riskScore === 'Low').length },
    { name: 'Medium Risk', value: enrollees.filter(e => e.riskScore === 'Medium').length },
    { name: 'High Risk', value: enrollees.filter(e => e.riskScore === 'High').length },
  ].filter(d => d.value > 0);

  const grievanceCategories = grievances.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const barData = Object.entries(grievanceCategories).map(([name, count]) => ({ name, count }));

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <div className="header-row">
              <h1>Programme Overview</h1>
              <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                <UploadCloud size={18} /> Upload Field Data
              </button>
            </div>

            {metrics && (
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Total Enrollees</span>
                  <span className="metric-value">{metrics.totalEnrollees}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Active Participants</span>
                  <span className="metric-value">{metrics.activeEnrollees}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Open Grievances</span>
                  <span className="metric-value">{metrics.totalGrievances - metrics.resolvedGrievances}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Resolved Grievances</span>
                  <span className="metric-value">{metrics.resolvedGrievances}</span>
                </div>
              </div>
            )}

            <div className="charts-container">
              <div className="chart-card">
                <h3 className="section-title">Dropout Risk Distribution</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution.length > 0 ? riskDistribution : [{ name: 'No Data', value: 1 }]}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="section-title">Grievances by Category</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData.length > 0 ? barData : [{ name: 'No Data', count: 0 }]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#F3F4F6' }} />
                      <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '3rem' }}>At-Risk Enrollees</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Centre</th>
                    <th>Status</th>
                    <th>Dropout Risk</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollees.filter(e => e.riskScore === 'High' || e.riskScore === 'Medium').slice(0, 5).map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.centre}</td>
                      <td>{e.status}</td>
                      <td>
                        <div className="status-indicator">
                          <span className={`dot ${getStatusDot(e.riskScore)}`}></span>
                          {e.riskScore}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: e.riskScore === 'High' ? 'var(--alert-color)' : 'inherit', fontWeight: e.riskScore === 'High' ? 600 : 400 }}>
                          {e.riskScore === 'High' ? 'Home Visit Required' : 'Monitor Weekly'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'enrollees':
        return (
          <>
            <div className="header-row">
              <h1>All Enrollees</h1>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Centre</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollees.map(e => (
                    <tr key={e.id}>
                      <td>#{e.id}</td>
                      <td style={{ fontWeight: 500 }}>{e.name}</td>
                      <td>{e.centre}</td>
                      <td>{e.status}</td>
                      <td>
                        <div className="status-indicator">
                          <span className={`dot ${getStatusDot(e.riskScore)}`}></span>
                          {e.riskScore}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'grievances':
        return (
          <>
            <div className="header-row">
              <h1>Grievance Log</h1>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Reporter</th>
                    <th>Centre</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map(g => (
                    <tr key={g.id}>
                      <td>#{g.id}</td>
                      <td style={{ fontWeight: 500 }}>{g.reporterName}</td>
                      <td>{g.centre}</td>
                      <td>{g.category}</td>
                      <td>
                        <span style={{ 
                          color: g.status === 'Resolved' ? 'var(--success-color)' : 
                                 g.status === 'Open' ? 'var(--alert-color)' : '#D97706',
                          fontWeight: 500 
                        }}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <LayoutDashboard size={24} color="var(--accent-color)" />
          Outreach Pulse
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Overview
          </li>
          <li className={`nav-item ${activeTab === 'enrollees' ? 'active' : ''}`} onClick={() => setActiveTab('enrollees')}>
            <Users size={18} /> Enrollees
          </li>
          <li className={`nav-item ${activeTab === 'grievances' ? 'active' : ''}`} onClick={() => setActiveTab('grievances')}>
            <AlertTriangle size={18} /> Grievances
          </li>
        </ul>
        <div style={{ marginTop: 'auto' }}>
          <li className="nav-item">
            <LogOut size={18} /> Sign Out
          </li>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Upload Field Data</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Upload attendance registers or grievance logs (CSV/XLSX). The system will automatically map the columns.
            </p>
            
            {uploadState === 'idle' && (
              <div className="upload-zone" onClick={handleUpload}>
                <FileSpreadsheet size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                <p>Click to browse or drag file here</p>
              </div>
            )}

            {uploadState === 'uploading' && (
              <div className="upload-zone" style={{ cursor: 'default', borderColor: 'var(--accent-color)' }}>
                <p>Processing & Mapping columns...</p>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="upload-zone" style={{ cursor: 'default', borderColor: 'var(--success-color)' }}>
                <CheckCircle2 size={48} color="var(--success-color)" style={{ margin: '0 auto 1rem' }} />
                <p>Data mapped successfully!</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                className="nav-item" 
                style={{ border: 'none', background: 'none' }}
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

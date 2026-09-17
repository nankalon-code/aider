import React, { useState, useRef } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Upload, Printer, Filter, Table, BarChart2, AlertCircle, FileText, CheckCircle2, 
  X, RefreshCw
} from 'lucide-react';
import './index.css';

// Tableau Plum & Rose Theme Palette (matching the user's reference image)
const PALETTE = {
  plumDark: '#6C1E37',
  plumMain: '#842846',
  plumMedium: '#A94363',
  roseMain: '#C96C88',
  roseLight: '#E19EAF',
  blushSoft: '#F1CCD6',
  blushTint: '#F9EBF0',
  slateDark: '#455A64',
  tealAccent: '#37474F'
};

interface Enrollee {
  id: number;
  name: string;
  centre: string;
  trade: string;
  attendanceRate: number;
  status: string;
  riskScore: 'High' | 'Medium' | 'Low';
  age: number;
  gender: 'Female' | 'Male';
}

interface Grievance {
  id: number;
  reporter: string;
  centre: string;
  category: string;
  severity: 1 | 2 | 3 | 4;
  status: 'Open' | 'In Progress' | 'Resolved';
  resolutionDays: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'enrollees' | 'grievances' | 'pipeline'>('dashboard');
  const [centreFilter, setCentreFilter] = useState<string>('All');
  const [educationFilter, setEducationFilter] = useState<string>('All');
  const [binSize, setBinSize] = useState<string>('2 Yrs');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Full Realistic Dataset
  const [enrollees, setEnrollees] = useState<Enrollee[]>([
    { id: 101, name: 'Asha Devi', centre: 'Okhla Ph-1', trade: 'Sewing Machine Operator', attendanceRate: 42, status: 'Active', riskScore: 'High', age: 24, gender: 'Female' },
    { id: 102, name: 'Sunita Mehra', centre: 'Tiruppur Hub', trade: 'Quality Inspector', attendanceRate: 78, status: 'Active', riskScore: 'Low', age: 31, gender: 'Female' },
    { id: 103, name: 'Ramesh Kumar', centre: 'Peenya Industrial', trade: 'Pattern Cutter & Master', attendanceRate: 51, status: 'Active', riskScore: 'Medium', age: 38, gender: 'Male' },
    { id: 104, name: 'Priya Sharma', centre: 'Surat Textile Park', trade: 'Finishing & Packaging', attendanceRate: 88, status: 'Active', riskScore: 'Low', age: 22, gender: 'Female' },
    { id: 105, name: 'Kavita Singh', centre: 'Okhla Ph-1', trade: 'Sewing Machine Operator', attendanceRate: 36, status: 'Active', riskScore: 'High', age: 29, gender: 'Female' },
    { id: 106, name: 'Mohammed Farooq', centre: 'Okhla Ph-1', trade: 'Machine Operator (Sewing)', attendanceRate: 48, status: 'Active', riskScore: 'High', age: 35, gender: 'Male' },
    { id: 107, name: 'Meena Thapa', centre: 'Tiruppur Hub', trade: 'Healthcare Representative', attendanceRate: 92, status: 'Active', riskScore: 'Low', age: 26, gender: 'Female' },
    { id: 108, name: 'Deepak Varma', centre: 'Peenya Industrial', trade: 'Laboratory Technician', attendanceRate: 64, status: 'Active', riskScore: 'Medium', age: 41, gender: 'Male' },
    { id: 109, name: 'Anjali Patel', centre: 'Surat Textile Park', trade: 'Sewing Machine Operator', attendanceRate: 39, status: 'Active', riskScore: 'High', age: 23, gender: 'Female' },
    { id: 110, name: 'Geeta Rani', centre: 'Okhla Ph-1', trade: 'Quality Inspector', attendanceRate: 85, status: 'Active', riskScore: 'Low', age: 33, gender: 'Female' },
    { id: 111, name: 'Suresh Babu', centre: 'Tiruppur Hub', trade: 'Floor Supervisor', attendanceRate: 59, status: 'Active', riskScore: 'Medium', age: 44, gender: 'Male' },
    { id: 112, name: 'Rekha Devi', centre: 'Okhla Ph-1', trade: 'Finishing & Packaging', attendanceRate: 41, status: 'Active', riskScore: 'High', age: 27, gender: 'Female' }
  ]);

  const [grievances] = useState<Grievance[]>([
    { id: 201, reporter: 'Kavita Singh', centre: 'Okhla Ph-1', category: 'Unpaid Wages & Overtime', severity: 4, status: 'Open', resolutionDays: 14 },
    { id: 202, reporter: 'Mohammed Farooq', centre: 'Okhla Ph-1', category: 'Verbal Abuse & Harassment', severity: 3, status: 'In Progress', resolutionDays: 7 },
    { id: 203, reporter: 'Ramesh Kumar', centre: 'Peenya Industrial', category: 'Unsafe Factory Machinery', severity: 4, status: 'Resolved', resolutionDays: 5 },
    { id: 204, reporter: 'Rekha Devi', centre: 'Okhla Ph-1', category: 'Maternity Benefit Denial', severity: 3, status: 'Open', resolutionDays: 12 },
    { id: 205, reporter: 'Sunita Mehra', centre: 'Tiruppur Hub', category: 'PF / ESI Default', severity: 2, status: 'Resolved', resolutionDays: 18 },
    { id: 206, reporter: 'Anjali Patel', centre: 'Surat Textile Park', category: 'Transport & Shift Issues', severity: 1, status: 'Resolved', resolutionDays: 3 }
  ]);

  // Dynamic Filtering based on selected Centre
  const filteredEnrollees = centreFilter === 'All' 
    ? enrollees 
    : enrollees.filter(e => e.centre === centreFilter);

  // Compute Dashboard Metrics dynamically (resembling the photo's exact KPI values)
  const totalEmployees = centreFilter === 'All' ? 1470 : filteredEnrollees.length * 122;
  const attritionCount = centreFilter === 'All' ? 237 : Math.round(filteredEnrollees.filter(e => e.riskScore === 'High').length * 47);
  const activeEmployees = totalEmployees - attritionCount;
  const attritionRate = ((attritionCount / totalEmployees) * 100).toFixed(2);
  const avgAge = 37;

  // Department / Centre Wise Attrition (Matches Donut Chart in photo)
  const centreAttritionData = [
    { name: 'Okhla Ph-1 (Garment Hub)', value: 133, share: '56.12%', color: PALETTE.plumDark },
    { name: 'Tiruppur Hub (Knitwear)', value: 92, share: '38.82%', color: PALETTE.plumMedium },
    { name: 'Peenya Ind. (Bangalore)', value: 12, share: '5.06%', color: PALETTE.roseLight },
    { name: 'Surat Textile Park', value: 5, share: '2.00%', color: PALETTE.blushSoft }
  ];

  // Number of Employees / Trainees by Age Group Histogram (Matches Center Chart in photo)
  const ageHistogramData = [
    { age: '18', count: 20, fill: PALETTE.plumDark },
    { age: '20', count: 48, fill: PALETTE.plumDark },
    { age: '22', count: 91, fill: PALETTE.plumMain },
    { age: '24', count: 164, fill: PALETTE.plumMain },
    { age: '27', count: 190, fill: PALETTE.plumMedium },
    { age: '30', count: 213, fill: PALETTE.roseLight },
    { age: '33', count: 177, fill: PALETTE.roseLight },
    { age: '36', count: 139, fill: PALETTE.blushSoft },
    { age: '39', count: 111, fill: PALETTE.blushSoft },
    { age: '42', count: 73, fill: PALETTE.plumMedium },
    { age: '45', count: 54, fill: PALETTE.plumMain },
    { age: '48', count: 38, fill: PALETTE.plumMain },
    { age: '51', count: 24, fill: PALETTE.plumDark },
    { age: '54', count: 18, fill: PALETTE.plumDark },
    { age: '57+', count: 12, fill: PALETTE.plumDark }
  ];

  // Job Satisfaction / Severity Rating Matrix Data (Matches Right Heatmap Table in photo)
  const matrixData = [
    { role: 'Healthcare Representative', r1: 26, r2: 19, r3: 41, r4: 45, total: 131 },
    { role: 'Human Resources & Welfare', r1: 10, r2: 16, r3: 13, r4: 13, total: 52 },
    { role: 'Laboratory & QC Technician', r1: 56, r2: 48, r3: 75, r4: 80, total: 259 },
    { role: 'Floor Supervisor & Manager', r1: 21, r2: 21, r3: 27, r4: 33, total: 102 },
    { role: 'Machine Operator (Sewing)', r1: 26, r2: 32, r3: 49, r4: 38, total: 145 },
    { role: 'Pattern Cutter & Master', r1: 15, r2: 14, r3: 27, r4: 24, total: 80 },
    { role: 'Research & Sample Scientist', r1: 54, r2: 53, r3: 90, r4: 95, total: 292 },
    { role: 'Finishing & Dispatch Exec', r1: 69, r2: 54, r3: 91, r4: 112, total: 326 },
    { role: 'Field Outreach Worker', r1: 12, r2: 21, r3: 27, r4: 23, total: 83 }
  ];

  // Calculate totals for the matrix bottom row
  const totalR1 = matrixData.reduce((acc, curr) => acc + curr.r1, 0);
  const totalR2 = matrixData.reduce((acc, curr) => acc + curr.r2, 0);
  const totalR3 = matrixData.reduce((acc, curr) => acc + curr.r3, 0);
  const totalR4 = matrixData.reduce((acc, curr) => acc + curr.r4, 0);
  const grandMatrixTotal = totalR1 + totalR2 + totalR3 + totalR4;

  // Education Field / Grievance Category Wise Horizontal Bar Data (Matches Bottom Left in photo)
  const grievanceHorizontalData = [
    { name: 'Unpaid Wages & OT', count: 89 },
    { name: 'Verbal Abuse / Harass', count: 63 },
    { name: 'Maternity Benefit Denial', count: 35 },
    { name: 'Unsafe Factory Machinery', count: 32 },
    { name: 'PF / ESI Default', count: 18 },
    { name: 'Transport / Hostel Issues', count: 11 }
  ];

  // Multi-Ring Donut Gauges by Age / Cohort Group (Matches Bottom Right in photo)
  const ageRingGauges = [
    { label: '<25 Yrs', count: 20, pct: '8.44%', female: 65, male: 35 },
    { label: '25-34 Yrs', count: 69, pct: '29.11%', female: 72, male: 28 },
    { label: '35-44 Yrs', count: 112, pct: '47.26%', female: 58, male: 42 },
    { label: '45-54 Yrs', count: 23, pct: '9.70%', female: 48, male: 52 },
    { label: '55+ Yrs', count: 10, pct: '4.22%', female: 40, male: 60 },
    { label: 'Grand Total', count: 3, pct: '1.27%', female: 62, male: 38 }
  ];

  // Helper function to color code heatmap cells like Tableau highlight table
  const getHeatmapColor = (val: number) => {
    if (val > 80) return { bg: PALETTE.plumMain, color: '#FFF' };
    if (val > 50) return { bg: PALETTE.roseMain, color: '#FFF' };
    if (val > 30) return { bg: PALETTE.roseLight, color: '#222' };
    if (val > 15) return { bg: PALETTE.blushSoft, color: '#222' };
    return { bg: PALETTE.blushTint, color: '#333' };
  };

  // Handle CSV file upload with fuzzy mapping simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    setUploadStatus('uploading');

    setTimeout(() => {
      setUploadStatus('success');
      // Add simulated parsed data to enrollees list
      setEnrollees(prev => [
        { id: 113, name: 'Saraswati Devi', centre: 'Okhla Ph-1', trade: 'Sewing Machine Operator', attendanceRate: 35, status: 'Active', riskScore: 'High', age: 25, gender: 'Female' },
        { id: 114, name: 'Govind Ram', centre: 'Tiruppur Hub', trade: 'Pattern Cutter', attendanceRate: 82, status: 'Active', riskScore: 'Low', age: 34, gender: 'Male' },
        ...prev
      ]);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadStatus('idle');
      }, 1400);
    }, 1500);
  };

  return (
    <div>
      {/* Tableau Top App Header Bar */}
      <header className="tableau-app-header">
        <div className="left-title">
          <BarChart2 size={15} color="#E0A6B6" />
          <span>OUTREACH PULSE — FIELD OPERATIONS & LABOUR RIGHTS ANALYTICS (TABLEAU PUBLIC)</span>
        </div>
        <div className="header-actions">
          <button className="tableau-btn" onClick={() => window.print()}>
            <Printer size={12} />
            <span>Export / Print PDF</span>
          </button>
          <button className="tableau-btn tableau-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={12} />
            <span>Upload Field Register (CSV/XLSX)</span>
          </button>
        </div>
      </header>

      {/* Main Tableau Canvas */}
      <main className="tableau-dashboard-container">
        {/* Main Dashboard Title & Filter Controls Bar */}
        <div className="dashboard-title-bar">
          <div>
            <h1>HUMAN RESOURCE ANALYTICS DASHBOARD</h1>
          </div>
          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={13} color="var(--tableau-text-muted)" />
              <label>Centre / Region:</label>
              <select 
                className="tableau-select" 
                value={centreFilter}
                onChange={(e) => setCentreFilter(e.target.value)}
              >
                <option value="All">(All Centres)</option>
                <option value="Okhla Ph-1">Okhla Ph-1 (Delhi NCR)</option>
                <option value="Tiruppur Hub">Tiruppur Hub (Tamil Nadu)</option>
                <option value="Peenya Industrial">Peenya Industrial (Karnataka)</option>
                <option value="Surat Textile Park">Surat Textile Park (Gujarat)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Education / Trade:</label>
              <select 
                className="tableau-select" 
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
              >
                <option value="All">(All Trades)</option>
                <option value="Sewing">Machine Operator</option>
                <option value="Cutting">Pattern Master</option>
                <option value="Quality">Quality Inspector</option>
                <option value="Finishing">Finishing & Packaging</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Switcher: Dashboard vs Raw Tables */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Ribbon (Matches Top 5 Cards + Gender Chart in photo) */}
            <section className="kpi-ribbon">
              <div className="kpi-card">
                <span className="kpi-label">Attrition Count</span>
                <span className="kpi-value">{attritionCount}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Employee Count</span>
                <span className="kpi-value">{totalEmployees.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Avg. Attrition Rate</span>
                <span className="kpi-value">{attritionRate}%</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Active Employees</span>
                <span className="kpi-value">{activeEmployees.toLocaleString()}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Avg. Age</span>
                <span className="kpi-value">{avgAge}</span>
              </div>
              
              {/* Attrition by Gender Slider Bar (Matches far right card in photo) */}
              <div className="kpi-card gender-card">
                <span className="kpi-label">Attrition by Gender</span>
                <div className="gender-bar-container">
                  <div className="gender-row">
                    <span className="gender-name">Female</span>
                    <div className="gender-track">
                      <div className="gender-fill" style={{ width: '62%', background: PALETTE.roseMain }}></div>
                      <div className="gender-dot" style={{ left: '62%', background: PALETTE.plumMain }}></div>
                    </div>
                    <span className="gender-value">87 (61.7%)</span>
                  </div>
                  <div className="gender-row">
                    <span className="gender-name">Male</span>
                    <div className="gender-track">
                      <div className="gender-fill" style={{ width: '38%', background: PALETTE.blushSoft }}></div>
                      <div className="gender-dot" style={{ left: '38%', background: PALETTE.roseMain }}></div>
                    </div>
                    <span className="gender-value">54 (38.3%)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Middle Section: Donut Pie | Multi-column Histogram | Matrix Heatmap */}
            <section className="dashboard-grid-middle">
              {/* 1. Department / Centre Wise Attrition (Pie Donut Chart) */}
              <div className="tableau-sheet">
                <div className="sheet-header">
                  <h3>Department Wise Attrition</h3>
                </div>
                <div style={{ width: '100%', height: 230, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={centreAttritionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={0}
                        dataKey="value"
                        label={(props: any) => props.share || ''}
                        labelLine={true}
                      >
                        {centreAttritionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFF" strokeWidth={1.5} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="tableau-tooltip">
                                <div className="tableau-tooltip-title">{d.name}</div>
                                <div>Count: <b>{d.value}</b> enrollees</div>
                                <div>Share: <b>{d.share}</b></div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Micro Legend under chart */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '6px', fontSize: '10px' }}>
                  {centreAttritionData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 9, height: 9, background: item.color, display: 'inline-block' }}></span>
                      <span style={{ color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name.split(' ')[0]} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Number of Employee by Age Group Histogram (Graduated Columns) */}
              <div className="tableau-sheet">
                <div className="sheet-header">
                  <h3>Number of Employee by Age Group</h3>
                  <div className="sheet-controls">
                    <span>Bin size:</span>
                    <select 
                      className="mini-select"
                      value={binSize}
                      onChange={(e) => setBinSize(e.target.value)}
                    >
                      <option value="1 Yr">1 Yr</option>
                      <option value="2 Yrs">2 Yrs</option>
                      <option value="5 Yrs">5 Yrs</option>
                    </select>
                  </div>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageHistogramData} margin={{ top: 18, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#EBE8E3" />
                      <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#555' }} tickLine={false} axisLine={{ stroke: '#CCC' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#555' }} tickLine={false} axisLine={{ stroke: '#CCC' }} />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="tableau-tooltip">
                                <div className="tableau-tooltip-title">Age: {payload[0].payload.age} Years</div>
                                <div>Count: <b>{payload[0].value}</b> employees</div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Bar 
                        dataKey="count" 
                        barSize={20}
                        label={{ position: 'top', fontSize: 9, fill: '#666' }}
                      >
                        {ageHistogramData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Job Satisfaction Rating Heatmap Matrix (Matches Table on Right in photo) */}
              <div className="tableau-sheet">
                <div className="sheet-header">
                  <h3>Job Satisfaction Rating</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="heatmap-table">
                    <thead>
                      <tr>
                        <th className="col-role">Job Role</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th className="col-total">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.map((row, i) => (
                        <tr key={i}>
                          <td className="col-role">{row.role}</td>
                          {([row.r1, row.r2, row.r3, row.r4] as const).map((val, idx) => {
                            const { bg, color } = getHeatmapColor(val);
                            return (
                              <td 
                                key={idx} 
                                className="heatmap-cell"
                                style={{ backgroundColor: bg, color }}
                              >
                                {val}
                              </td>
                            );
                          })}
                          <td className="col-total">{row.total}</td>
                        </tr>
                      ))}
                      <tr className="row-total">
                        <td className="col-role">Grand Total</td>
                        <td>{totalR1}</td>
                        <td>{totalR2}</td>
                        <td>{totalR3}</td>
                        <td>{totalR4}</td>
                        <td className="col-total">{grandMatrixTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Bottom Section: Horizontal Bars | Multi-Ring Donut Gauges */}
            <section className="dashboard-grid-bottom">
              {/* 1. Education Field Wise Attrition (Horizontal Bar Chart) */}
              <div className="tableau-sheet">
                <div className="sheet-header">
                  <h3>Education Field Wise Attrition</h3>
                </div>
                <div style={{ width: '100%', height: 195 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={grievanceHorizontalData} 
                      layout="vertical"
                      margin={{ top: 8, right: 35, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#EBE8E3" />
                      <XAxis type="number" tick={{ fontSize: 9.5, fill: '#555' }} tickLine={false} axisLine={{ stroke: '#CCC' }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={120} 
                        tick={{ fontSize: 9.5, fill: '#333' }} 
                        tickLine={false} 
                        axisLine={{ stroke: '#CCC' }}
                      />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="tableau-tooltip">
                                <div className="tableau-tooltip-title">{payload[0].payload.name}</div>
                                <div>Volume: <b>{payload[0].value}</b> cases</div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Bar 
                        dataKey="count" 
                        fill={PALETTE.roseMain} 
                        barSize={12}
                        label={{ position: 'right', fontSize: 9.5, fill: '#444', fontWeight: 600 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Attrition Rate by Gender for Different Age Group (6 Ring Gauges) */}
              <div className="tableau-sheet">
                <div className="sheet-header">
                  <h3>Attrition Rate by Gender for Different Age Group</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, background: PALETTE.plumDark, display: 'inline-block' }}></span>
                      Female
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, background: PALETTE.roseMain, display: 'inline-block' }}></span>
                      Male
                    </span>
                  </div>
                </div>

                <div className="multi-ring-container">
                  {ageRingGauges.map((ring, idx) => (
                    <div className="ring-card" key={idx}>
                      <div className="ring-graphic">
                        <ResponsiveContainer width={76} height={76}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Female', value: ring.female },
                                { name: 'Male', value: ring.male }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={24}
                              outerRadius={35}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                            >
                              <Cell fill={PALETTE.plumDark} />
                              <Cell fill={PALETTE.roseMain} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="ring-inner-badge">
                          <div className="ring-inner-count">{ring.count}</div>
                          <div className="ring-inner-rate">{ring.pct}</div>
                        </div>
                      </div>
                      <div className="ring-label">{ring.label}</div>
                      <div className="ring-subtext">Age Band</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* View 2: At-Risk Trainees Registry Table */}
        {activeTab === 'enrollees' && (
          <div className="tableau-sheet">
            <div className="sheet-header">
              <h3>AT-RISK TRAINEE ATTENDANCE REGISTRY & EARLY DROPOUT PREDICTIONS</h3>
              <span style={{ fontSize: '11px', color: 'var(--tableau-text-muted)' }}>
                Showing {filteredEnrollees.length} field records
              </span>
            </div>
            <table className="tableau-data-table">
              <thead>
                <tr>
                  <th>Enrollee ID</th>
                  <th>Worker Name</th>
                  <th>Centre Hub</th>
                  <th>Trade Discipline</th>
                  <th>Gender / Age</th>
                  <th>Early Attendance</th>
                  <th>Dropout Risk</th>
                  <th>Recommended Coordinator Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollees.map((e) => (
                  <tr key={e.id}>
                    <td>#{e.id}</td>
                    <td style={{ fontWeight: 600 }}>{e.name}</td>
                    <td>{e.centre}</td>
                    <td>{e.trade}</td>
                    <td>{e.gender}, {e.age}y</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 50, height: 6, background: '#E0DDD8', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${e.attendanceRate}%`, height: '100%', background: e.attendanceRate < 50 ? PALETTE.plumDark : PALETTE.roseMain }}></div>
                        </div>
                        <span>{e.attendanceRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tableau-pill risk-${e.riskScore.toLowerCase()}`}>
                        {e.riskScore}
                      </span>
                    </td>
                    <td>
                      {e.riskScore === 'High' ? (
                        <span style={{ color: PALETTE.plumDark, fontWeight: 700 }}>
                          🚨 Urgent Home Visit & Wage Verification
                        </span>
                      ) : (
                        <span style={{ color: '#444' }}>Regular Bi-weekly Check-in</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 3: Grievance Helpline Log */}
        {activeTab === 'grievances' && (
          <div className="tableau-sheet">
            <div className="sheet-header">
              <h3>WORKER HELPLINE GRIEVANCE LOG (GARMENT & TEXTILE CLUSTERS)</h3>
              <span style={{ fontSize: '11px', color: 'var(--tableau-text-muted)' }}>
                {grievances.length} Active Incidents Logged
              </span>
            </div>
            <table className="tableau-data-table">
              <thead>
                <tr>
                  <th>Grievance ID</th>
                  <th>Reporter</th>
                  <th>Centre</th>
                  <th>Issue Category</th>
                  <th>Severity Level</th>
                  <th>Resolution Status</th>
                  <th>Days in SLA</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => (
                  <tr key={g.id}>
                    <td>#{g.id}</td>
                    <td style={{ fontWeight: 600 }}>{g.reporter}</td>
                    <td>{g.centre}</td>
                    <td>{g.category}</td>
                    <td>Level {g.severity}</td>
                    <td>
                      <span className={`tableau-pill ${g.status === 'Resolved' ? 'risk-low' : 'risk-high'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>{g.resolutionDays} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View 4: Data Ingestion & Audit Trail */}
        {activeTab === 'pipeline' && (
          <div className="tableau-sheet">
            <div className="sheet-header">
              <h3>DATA INGESTION PIPELINE & AUDIT TRAIL</h3>
            </div>
            <div style={{ padding: '16px', lineHeight: 1.6 }}>
              <h4 style={{ color: PALETTE.plumMain, marginBottom: 8 }}>Fuzzy Schema Normalization Log</h4>
              <p style={{ color: '#555', marginBottom: 16 }}>
                Outreach Pulse automatically resolves messy field columns to standard operational schemas:
              </p>
              <table className="tableau-data-table" style={{ maxWidth: 650 }}>
                <thead>
                  <tr>
                    <th>Incoming Raw Field</th>
                    <th>Canonical Schema Column</th>
                    <th>Confidence</th>
                    <th>Transformation Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Worker_Name_Text</code></td>
                    <td><code>name</code></td>
                    <td>94% (Levenshtein)</td>
                    <td><span className="tableau-pill risk-low">Auto-Mapped</span></td>
                  </tr>
                  <tr>
                    <td><code>att_pct_days</code></td>
                    <td><code>attendanceRate</code></td>
                    <td>89% (Levenshtein)</td>
                    <td><span className="tableau-pill risk-low">Auto-Mapped</span></td>
                  </tr>
                  <tr>
                    <td><code>complaint_cat</code></td>
                    <td><code>category</code></td>
                    <td>92% (Levenshtein)</td>
                    <td><span className="tableau-pill risk-low">Standardized</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Tableau Bottom Worksheet Tab Bar (Matches Tableau Public sheets footer) */}
      <footer className="tableau-tab-strip">
        <button 
          className={`tableau-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart2 size={13} />
          <span>Human Resource Analytics</span>
        </button>
        <button 
          className={`tableau-tab-item ${activeTab === 'enrollees' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollees')}
        >
          <Table size={13} />
          <span>Department Wise Attrition</span>
        </button>
        <button 
          className={`tableau-tab-item ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          <AlertCircle size={13} />
          <span>Helpline Grievance Log</span>
        </button>
        <button 
          className={`tableau-tab-item ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <FileText size={13} />
          <span>Pipeline Ingestion Audit</span>
        </button>
      </footer>

      {/* Upload Field Register Modal Styled like Tableau Data Connector */}
      {isUploadModalOpen && (
        <div className="tableau-modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="tableau-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tableau-modal-header">
              <span>Connect to Data Source — Upload Register</span>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="tableau-modal-body">
              <p style={{ color: '#555', fontSize: '12px', marginBottom: '14px' }}>
                Upload field registers (CSV or XLSX) with attendance rolls or worker grievance records. 
                Fuzzy matching will automatically reconcile header names.
              </p>

              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv,.xlsx" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
              />

              {uploadStatus === 'idle' && (
                <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={36} color={PALETTE.plumMain} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, color: '#333' }}>Click to choose CSV/XLSX file</div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                    Supports irregular headers like "Wrkr Nm", "Att Date", "Grievance Det"
                  </div>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="upload-dropzone" style={{ borderColor: PALETTE.plumMain }}>
                  <RefreshCw size={32} color={PALETTE.plumMain} className="spinning-icon" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, color: PALETTE.plumMain }}>
                    Parsing columns & applying fuzzy schema matching...
                  </div>
                  <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                    Reading {uploadFileName}
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="upload-dropzone" style={{ borderColor: '#2E7D32', background: '#F1F8F2' }}>
                  <CheckCircle2 size={36} color="#2E7D32" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, color: '#2E7D32' }}>Data Ingested & Normalized Successfully!</div>
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                    Added new records to live Tableau dashboard view.
                  </div>
                </div>
              )}
            </div>

            <div className="tableau-modal-footer">
              <button 
                className="tableau-btn" 
                onClick={() => setIsUploadModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

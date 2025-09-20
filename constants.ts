
import { Page, Alert, AlertLevel, AgentCluster, Agent, ScamReport } from './types';

export const NAV_ITEMS: { name: Page; icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; }[] = [
    // Icons will be imported in the component
];

export const MOCK_ALERTS: Alert[] = [
    {
        id: 'txn_112358',
        timestamp: new Date(),
        amount: 85000,
        agentId: 'AGT007',
        from: '254722****56',
        to: '254712****34',
        level: AlertLevel.High,
        reasons: ['Amount is 5.2x user average', 'Transaction at 02:15 AM'],
        location: { lat: -1.286389, lon: 36.817223 },
        model: 'rule',
    },
    {
        id: 'txn_132134',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        amount: 1500,
        agentId: 'AGT019',
        from: '254700****11',
        to: '254799****22',
        level: AlertLevel.Medium,
        reasons: ['Rapid micro-cashout burst (4 in 2 mins)'],
        location: { lat: -4.043477, lon: 39.668205 },
        model: 'iso_forest',
    },
];

export const MOCK_AGENTS: Agent[] = [
  { agent_id: 'AGT007', name_masked: 'J. Mwangi', city: 'Nairobi', lat: -1.2921, lon: 36.8219, avg_volume: 120000, disputes: 5 },
  { agent_id: 'AGT019', name_masked: 'F. Omondi', city: 'Mombasa', lat: -4.0435, lon: 39.6682, avg_volume: 75000, disputes: 12 },
  { agent_id: 'AGT042', name_masked: 'A. Patel', city: 'Kisumu', lat: -0.0917, lon: 34.7680, avg_volume: 95000, disputes: 2 },
  { agent_id: 'AGT101', name_masked: 'S. Wanjiru', city: 'Nairobi', lat: -1.2821, lon: 36.8319, avg_volume: 210000, disputes: 18 },
  { agent_id: 'AGT102', name_masked: 'K. Aden', city: 'Mombasa', lat: -4.0535, lon: 39.6582, avg_volume: 60000, disputes: 0 },
  { agent_id: 'AGT103', name_masked: 'P. Kimani', city: 'Nairobi', lat: -1.3021, lon: 36.8119, avg_volume: 15000, disputes: 22 },
];


export const MOCK_AGENT_CLUSTERS: AgentCluster[] = [
    {
        cluster_id: 1,
        risk_score: 0.89,
        agents: [MOCK_AGENTS[0], MOCK_AGENTS[3], MOCK_AGENTS[5]],
        sample_txns: ['txn_112358', 'txn_987654', 'txn_555444'],
    },
    {
        cluster_id: 2,
        risk_score: 0.45,
        agents: [MOCK_AGENTS[1], MOCK_AGENTS[4]],
        sample_txns: ['txn_132134', 'txn_333222'],
    },
    {
        cluster_id: 3,
        risk_score: 0.12,
        agents: [MOCK_AGENTS[2]],
        sample_txns: ['txn_001122'],
    },
];

export const MOCK_SCAM_REPORTS: ScamReport[] = [
  { report_id: 'rep_001', reporter_masked: '254722****01', suspected_phone_masked: '254711****02', message: 'Got a message about a fake loan offer.', label: 'loan', lat: -1.28, lon: 36.81, timestamp: new Date().toISOString() },
  { report_id: 'rep_002', reporter_masked: '254700****03', suspected_phone_masked: '254798****04', message: 'Won a promotion I never entered.', label: 'offer', lat: -1.30, lon: 36.83, timestamp: new Date().toISOString() },
  { report_id: 'rep_003', reporter_masked: '254712****05', suspected_phone_masked: '254755****06', message: 'Someone pretending to be from the bank called.', label: 'impersonation', lat: -4.05, lon: 39.66, timestamp: new Date().toISOString() },
  { report_id: 'rep_004', reporter_masked: '254723****07', suspected_phone_masked: '254718****08', message: 'urgent call back needed for prize', label: 'offer', lat: 0.15, lon: 34.74, timestamp: new Date().toISOString() },
  { report_id: 'rep_005', reporter_masked: '254724****09', suspected_phone_masked: '254719****10', message: 'easy loan approval click link', label: 'loan', lat: -1.27, lon: 36.82, timestamp: new Date().toISOString() },
];

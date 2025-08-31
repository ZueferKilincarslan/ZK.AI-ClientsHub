import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, Workflow, Analytics } from '../../lib/supabase';
import { 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Pause,
} from 'lucide-react';

// Import new modular components
import ClientDetailHeader from '../../components/admin/client-detail/ClientDetailHeader';
import ClientInfoCard from '../../components/admin/client-detail/ClientInfoCard';
import ClientStatsGrid from '../../components/admin/client-detail/ClientStatsGrid';
import ClientDetailTabs from '../../components/admin/client-detail/ClientDetailTabs';
import ClientOverviewTab from '../../components/admin/client-detail/ClientOverviewTab';
import ClientWorkflowsTab from '../../components/admin/client-detail/ClientWorkflowsTab';
import ClientAnalyticsTab from '../../components/admin/client-detail/ClientAnalyticsTab';

interface ClientData extends Profile {
  workflows: Workflow[];
  analytics: Analytics[];
}

export default function ClientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Status configuration for workflows, passed to sub-components
  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      border: 'border-green-400/30',
      label: 'Active',
    },
    paused: {
      icon: Pause,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      border: 'border-yellow-400/30',
      label: 'Paused',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/20',
      border: 'border-red-400/30',
      label: 'Failed',
    },
  };

  useEffect(() => {
    if (user && id) {
      fetchClientData();
    }
  }, [user, id]);

  const fetchClientData = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      
      // Fetch client profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch client workflows
      const { data: workflows, error: workflowsError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', id)
        .order('updated_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Fetch client analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', id)
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;

      setClient({
        ...profile,
        workflows: workflows || [],
        analytics: analytics || [],
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white">Client not found</h3>
        <p className="mt-1 text-sm text-purple-300">
          The requested client could not be found.
        </p>
        <Link
          to="/clients"
          className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientDetailHeader />

      <ClientInfoCard client={client} />

      <ClientStatsGrid workflows={client.workflows} analytics={client.analytics} />

      <ClientDetailTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        workflowCount={client.workflows.length} 
      />

      <div className="p-6 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        {activeTab === 'overview' && (
          <ClientOverviewTab workflows={client.workflows} statusConfig={statusConfig} />
        )}

        {activeTab === 'workflows' && (
          <ClientWorkflowsTab 
            client={client} 
            user={user} 
            fetchClientData={fetchClientData} 
            statusConfig={statusConfig} 
          />
        )}

        {activeTab === 'analytics' && (
          <ClientAnalyticsTab analytics={client.analytics} />
        )}
      </div>
    </div>
  );
}
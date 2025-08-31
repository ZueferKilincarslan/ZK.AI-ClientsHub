import React from 'react';
import { Mail, Calendar } from 'lucide-react';
import { Profile } from '../../../lib/supabase';

interface ClientInfoCardProps {
  client: Profile & { workflows: any[] }; // Extend Profile to include workflows for count
}

export default function ClientInfoCard({ client }: ClientInfoCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
      <div className="px-6 py-6">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg">
            {client.avatar_url ? (
              <img 
                src={client.avatar_url} 
                alt={client.full_name || client.email}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-white">
                {client.full_name?.charAt(0) || client.email.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {client.full_name || 'Unnamed Client'}
            </h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-purple-300">
                <Mail className="mr-2 h-4 w-4" />
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex items-center text-purple-300">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-sm">
                  Joined {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{client.workflows.length}</div>
            <div className="text-sm text-purple-300">Workflows</div>
          </div>
        </div>
      </div>
    </div>
  );
}
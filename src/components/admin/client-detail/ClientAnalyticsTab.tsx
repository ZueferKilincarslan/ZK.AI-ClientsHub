import React from 'react';
import { Analytics } from '../../../lib/supabase';
import AnalyticsTableRow from './AnalyticsTableRow';

interface ClientAnalyticsTabProps {
  analytics: Analytics[];
}

export default function ClientAnalyticsTab({ analytics }: ClientAnalyticsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Analytics Data</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-500/20">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {analytics.map((analytic) => (
              <AnalyticsTableRow key={analytic.id} analytic={analytic} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
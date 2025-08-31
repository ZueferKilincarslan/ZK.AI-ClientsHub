import React from 'react';
import { Analytics } from '../../../lib/supabase';

interface AnalyticsTableRowProps {
  analytic: Analytics;
}

export default function AnalyticsTableRow({ analytic }: AnalyticsTableRowProps) {
  return (
    <tr key={analytic.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
        {analytic.metric_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
        {analytic.metric_value}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
        {new Date(analytic.date).toLocaleDateString()}
      </td>
    </tr>
  );
}
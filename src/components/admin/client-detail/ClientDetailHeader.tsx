import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link
          to="/clients"
          className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </div>
    </div>
  );
}
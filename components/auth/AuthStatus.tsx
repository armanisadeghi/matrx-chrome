import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

export function AuthStatus() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <Badge variant="warning">Not signed in</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <User className="w-3 h-3 text-[color:var(--m-text-tertiary)] shrink-0" />
      <span className="text-[color:var(--m-text-secondary)] truncate max-w-[140px]" style={{ fontSize: '11px' }}>
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="ml-auto p-0.5 text-[color:var(--m-text-tertiary)] hover:text-[var(--m-error)] cursor-pointer transition-colors"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
      </button>
    </div>
  );
}

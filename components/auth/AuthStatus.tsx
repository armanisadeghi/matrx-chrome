import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

export function AuthStatus() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Badge variant="warning">Not signed in</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <User className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
      <span className="text-sm text-[color:var(--m-text-secondary)] truncate max-w-[150px]">
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="ml-auto p-1 text-[color:var(--m-text-tertiary)] hover:text-[var(--m-error)] cursor-pointer transition-colors"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

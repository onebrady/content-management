import React from 'react';

type PresenceUser = { id: string; name?: string };

type UserPresenceProps = {
  users?: PresenceUser[];
  className?: string;
};

function UserPresenceComponent({ users }: UserPresenceProps) {
  // Minimal placeholder implementation for tests
  if (!users || users.length === 0) return null;
  return (
    <div data-testid="user-presence">
      {users.map((u) => (
        <span key={u.id}>{u.name || u.id}</span>
      ))}
    </div>
  );
}

export default UserPresenceComponent;
export { UserPresenceComponent as UserPresence };

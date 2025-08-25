import { Bell } from 'lucide-react';
import { useActivity } from '../../application/contexts/ActivityContext';

interface NotificationIconProps {
  onClick: () => void;
}

export default function NotificationIcon({ onClick }: NotificationIconProps) {
  const { state } = useActivity();
  
  // Contar notificaciones no leídas
  const unreadCount = state.notificaciones.filter(n => !n.leida).length;
  
  return (
    <div className="notification-icon-container" onClick={onClick}>
      <div className="notification-icon">
        <Bell size={28} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
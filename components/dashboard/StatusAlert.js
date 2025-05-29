import React, { memo, useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const StatusAlert = memo(({ 
  type = 'success', // success, warning, info, error
  message,
  description,
  duration = 5000, // 자동 닫힘 시간 (ms), 0이면 자동 닫힘 없음
  onClose,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);

  // 타입별 설정
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/10 backdrop-blur-sm border border-success/20',
      textColor: 'text-success'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10 backdrop-blur-sm border border-warning/20',
      textColor: 'text-warning'
    },
    info: {
      icon: Info,
      bgColor: 'bg-info/10 backdrop-blur-sm border border-info/20',
      textColor: 'text-info'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-error/10 backdrop-blur-sm border border-error/20',
      textColor: 'text-error'
    }
  };

  const { icon: Icon, bgColor, textColor } = config[type] || config.info;

  // 자동 닫힘 타이머
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`alert ${bgColor} shadow-lg ${textColor} rounded-xl ${className}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" />
        <div>
          <span className="font-medium">{message}</span>
          {description && <p className="text-sm opacity-80">{description}</p>}
        </div>
      </div>
      {onClose && (
        <button 
          className="btn btn-sm btn-ghost btn-circle ml-auto"
          onClick={() => {
            setVisible(false);
            onClose();
          }}
        >
          <span className="sr-only">닫기</span>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

StatusAlert.displayName = 'StatusAlert';

export default StatusAlert; 
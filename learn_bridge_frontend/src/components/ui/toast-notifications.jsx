import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Types: success, error, info
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

const Toast = ({ message, type, onClose }) => {
  const { theme } = { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' };
  
  const bgColor = {
    success: theme === 'dark' ? 'bg-green-800/90' : 'bg-green-100',
    error: theme === 'dark' ? 'bg-red-800/90' : 'bg-red-100',
    info: theme === 'dark' ? 'bg-blue-800/90' : 'bg-blue-100'
  };

  const textColor = {
    success: theme === 'dark' ? 'text-green-200' : 'text-green-800',
    error: theme === 'dark' ? 'text-red-200' : 'text-red-800',
    info: theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
  };

  const borderColor = {
    success: theme === 'dark' ? 'border-green-700' : 'border-green-200',
    error: theme === 'dark' ? 'border-red-700' : 'border-red-200',
    info: theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }[type];

  return (
    <div className={`${bgColor[type]} ${borderColor[type]} border rounded-lg shadow-lg p-4 flex items-start max-w-sm w-full mb-2`}>
      <Icon className={`${textColor[type]} h-5 w-5 mt-0.5 mr-3 flex-shrink-0`} />
      <div className="flex-1">
        <p className={`${textColor[type]}`}>{message}</p>
      </div>
      <button onClick={onClose} className={`${textColor[type]} ml-3 hover:opacity-70`}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
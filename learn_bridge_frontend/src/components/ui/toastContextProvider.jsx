import { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useToast } from './toast-notifications';
import {ToastContainer} from './toast-notifications'
// Create a context for toast
export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toastHelpers = useToast();
  
  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      <ToastContainer 
        toasts={toastHelpers.toasts} 
        removeToast={toastHelpers.removeToast} 
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => useContext(ToastContext);

export default ToastProvider;
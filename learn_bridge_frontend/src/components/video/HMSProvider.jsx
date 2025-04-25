import React from 'react';
import { HMSRoomProvider } from '@100mslive/react-sdk';

const HMSProvider = ({ children }) => {
  return (
    <HMSRoomProvider>
      {children}
    </HMSRoomProvider>
  );
};

export default HMSProvider;
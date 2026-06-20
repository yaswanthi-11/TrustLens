import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let reconnectTimeout = null;
let isConnected = false;

export const connectWebSocket = (onScanReceived, onScanUpdated) => {
  if (isConnected) return;

  // Since we proxy '/ws' in Vite config
  const socket = new SockJS('/ws');
  stompClient = Stomp.over(socket);
  
  // Disable console debug logs to keep browser console clean
  stompClient.debug = null;

  stompClient.connect({}, 
    (frame) => {
      isConnected = true;
      console.log('Connected to TrustLens X WebSocket');
      
      // Subscribe to fresh scans feed
      stompClient.subscribe('/topic/scans', (message) => {
        if (message.body) {
          const scan = JSON.parse(message.body);
          if (onScanReceived) onScanReceived(scan);
        }
      });

      // Subscribe to background VirusTotal updates
      stompClient.subscribe('/topic/scans/update', (message) => {
        if (message.body) {
          const scan = JSON.parse(message.body);
          if (onScanUpdated) onScanUpdated(scan);
        }
      });
    }, 
    (error) => {
      console.warn('WebSocket connection lost, attempting reconnection in 5s...', error);
      isConnected = false;
      // Auto reconnect
      reconnectTimeout = setTimeout(() => {
        connectWebSocket(onScanReceived, onScanUpdated);
      }, 5000);
    }
  );
};

export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (stompClient !== null && isConnected) {
    stompClient.disconnect(() => {
      console.log('Disconnected from TrustLens X WebSocket');
    });
    stompClient = null;
    isConnected = false;
  }
};

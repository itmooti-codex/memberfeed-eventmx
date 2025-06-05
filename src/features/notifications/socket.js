import { PROTOCOL, WS_ENDPOINT, ANN_ID, KEEPALIVE_MS, MAX_BACKOFF, GLOBAL_AUTHOR_ID } from '../../config.js';
import { NOTIFICATIONS_QUERY } from '../../api/queries.js';

export function startNotificationSocket(renderNotification) {
  let socket;
  let backoff = 1000;
  let keepAliveTimer;

  function startKeepAlive() {
    if (!keepAliveTimer) {
      keepAliveTimer = setInterval(
        () => sendSafe({ type: 'KEEP_ALIVE' }),
        KEEPALIVE_MS
      );
    }
  }

  function isOpen() {
    return socket && socket.readyState === WebSocket.OPEN;
  }

  function sendSafe(payload) {
    const msg = JSON.stringify(payload);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    } else {
      socket.addEventListener('open', () => socket.send(msg), { once: true });
    }
  }

  function connect() {
    socket = new WebSocket(WS_ENDPOINT, PROTOCOL);
    socket.addEventListener('open', () => {
      backoff = 1000;
      sendSafe({ type: 'CONNECTION_INIT' });
      startKeepAlive();
    });
    socket.addEventListener('message', ({ data }) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }
      if (msg.type === 'CONNECTION_ACK') {
        sendSafe({
          id: ANN_ID,
          type: 'GQL_START',
          payload: { query: NOTIFICATIONS_QUERY, variables: { author_id: GLOBAL_AUTHOR_ID } },
        });
      } else if (msg.type === 'GQL_DATA' && msg.id === ANN_ID && msg.payload?.data) {
        (msg.payload.data.subscribeToAnnouncements || []).forEach(renderNotification);
      }
    });
    socket.addEventListener('close', () => {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, MAX_BACKOFF);
    });
  }

  connect();

  return {
    close() {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'CONNECTION_TERMINATE' }));
        socket.close();
      }
    },
    reconnect() {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connect();
      } else if (!keepAliveTimer) {
        startKeepAlive();
      }
    },
    isOpen,
    sendSafe,
  };
}

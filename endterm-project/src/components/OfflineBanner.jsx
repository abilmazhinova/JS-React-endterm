import React from 'react';

export default function OfflineBanner() {
  const [online, setOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleStatusChange = () => setOnline(navigator.onLine);

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  if (online) return null;

  return (
    <div className="offline-banner">
      You are offline. Some features may be unavailable.
    </div>
  );
}

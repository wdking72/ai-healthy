'use client'

import { useState, useCallback } from 'react'
import SessionHistory from "@/components/frontend/consult/sessionHistory";
import Message from "@/components/frontend/consult/message";

export default function AiConsult() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSessionChange = useCallback((id: string | null) => {
    setActiveSessionId(id)
    if (id) setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-[calc(100vh-70px)]">
      <SessionHistory
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        refreshKey={refreshKey}
      />
      <Message
        sessionId={activeSessionId}
        onSessionChange={handleSessionChange}
      />
    </div>
  );
}

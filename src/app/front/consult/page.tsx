import SessionHistory from "@/components/frontend/consult/sessionHistory";
import Message from "@/components/frontend/consult/message";

export default function AiConsult() {
  return (
    <div className="flex h-[calc(100vh-70px)]">
      <SessionHistory />
      <Message />
    </div>
  );
}

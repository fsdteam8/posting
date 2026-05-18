import { ConversationPageClient } from "../_components/conversation-page-client";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  return <ConversationPageClient conversationId={conversationId} />;
}

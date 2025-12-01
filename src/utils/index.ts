import { Conversation, NormalizedConversation } from '../types/messaging.js';

export const sanitizeName = (originalName: string) => {
  const sanitizedName = originalName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '');

  return sanitizedName;
};

export const normalizedConversations = (
  conversations: Conversation[],
  userId: string
): NormalizedConversation[] => {


  console.log("Conversations in normalized conversations; ", conversations[0].participants[0].user)
  console.log("Conversations in normalized conversations 2 ", conversations[0].participants[1].user)
  try {
    return conversations.map((c) => ({
      id: c.id,
      receipent: c.participants.map((p) => {
        if (p.user.id !== userId) {
          return {
            id: p.user.id,
            email: p.user.email,
            name:
              p.user.role === 'EMPLOYER' &&
              p.user.companies.length > 0 &&
              p.user.companies[0].name
                ? p.user.companies[0].name
                : `${p.user.firstName} ${p.user.lastName}`,
            avatar:
              p.user.companies && p.user.companies.length > 0 && p.user.companies[0].logo ? 
                p.user.companies[0].logo : 
              p.user.role === 'JOBSEEKER' && p.user.profile && p.user.profile.profileImageURL ? 
                p.user.profile.profileImageURL : 
                null,
          };
        }
        return null;
        
      }).filter(Boolean)[0],
      updatedAt: c.updatedAt,
      messages: c.messages?.sort((m1, m2) => m1.createdAt.getTime() - m2.createdAt.getTime()),
      lastMessage: c.messages?.[c.messages.length - 1],
      createdAt: c.messages?.[0]?.createdAt || undefined,
      unreadCount: c.messages?.filter((m) => !!m.readAt).length,
    }));
  } catch (err) {
    console.error('Error formatting conversation participants: ', err);
    return [];
  }
};

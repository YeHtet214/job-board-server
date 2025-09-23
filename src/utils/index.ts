import { Conversation } from "../types/messaging.js";

export const sanitizeName = (originalName: string) => {
    const sanitizedName = originalName
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, ''); 

    return sanitizedName;
}

/**
 * Format each conversation's participants to include either profile image (for jobseekers)
 * or company logo (for employers) in the user object.
 */
export const formatConversationParticipants = (conversations: Conversation[]) => {
  return conversations.map(c => ({
    ...c,
    participants: c.participants?.map(p => ({
      ...p,
      user: (p.user.profile && p.user.companies.length === 0)
        ? {
            id: p.user.id,
            firstName: p.user.firstName,
            lastName: p.user.lastName,
            email: p.user.email,
            role: p.user.role,
            profileImageURL: p.user.profile.profileImageURL
          }
        : {
            id: p.user.id,
            firstName: p.user.firstName,
            lastName: p.user.lastName,
            email: p.user.email,
            role: p.user.role,
            logo: p.user.companies[0].logo
          }
    }))
  }));
}
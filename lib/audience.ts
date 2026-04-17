import { Member, AudienceGroup } from '@/types';

export function getFilteredRecipients(
  selectedGroups: AudienceGroup[],
  activeMembers: Member[]
): Member[] {
  if (selectedGroups.length === 0) return [];

  if (selectedGroups.includes('ALL')) {
    return activeMembers;
  }

  const recipientMap = new Map<string, Member>();

  selectedGroups.forEach(group => {
    let filtered: Member[];

    if (group === 'EB') {
      filtered = activeMembers.filter(
        m => m?.role?.toUpperCase().includes('EB') || m?.committee?.toUpperCase() === 'EB'
      );
    } else if (group === 'MEMBERS_ONLY') {
      filtered = activeMembers.filter(
        m => m?.role?.toLowerCase().includes('member')
      );
    } else {
      filtered = activeMembers.filter(m => m?.committee?.toUpperCase() === group);
    }

    filtered.forEach(m => {
      recipientMap.set(m.email, m);
    });
  });

  return Array.from(recipientMap.values());
}

'use client';

import { useEffect, useState } from 'react';
import { AudienceGroup, AUDIENCE_GROUPS, Member } from '@/types';
import { getFilteredRecipients } from '@/lib/audience';

interface Props {
  selectedGroups: AudienceGroup[];
  onSelectionChange: (groups: AudienceGroup[]) => void;
  members: Member[];
}

export default function AudienceSelector({ selectedGroups, onSelectionChange, members }: Props) {
  const activeMembers = members.filter(m => m.status === 'Active');

  const getCount = (group: AudienceGroup): number => {
    if (group === 'ALL') return activeMembers.length;
    if (group === 'EB') {
      return activeMembers.filter(
        m => m?.role?.toUpperCase().includes('EB') || m?.committee?.toUpperCase() === 'EB'
      ).length;
    }
    if (group === 'MEMBERS_ONLY') {
      return activeMembers.filter(
        m => m?.role?.toLowerCase().includes('member')
      ).length;
    }
    return activeMembers.filter(m => m?.committee?.toUpperCase() === group).length;
  };

  const getRecipientCount = (): number => {
    return getFilteredRecipients(selectedGroups, activeMembers).length;
  };

  const toggleGroup = (group: AudienceGroup) => {
    if (group === 'ALL') {
      if (selectedGroups.includes('ALL')) {
        onSelectionChange([]);
      } else {
        onSelectionChange(['ALL']);
      }
      return;
    }

    // If ALL is currently selected and we click a specific group, switch to just that group
    if (selectedGroups.includes('ALL')) {
      onSelectionChange([group]);
      return;
    }

    if (selectedGroups.includes(group)) {
      onSelectionChange(selectedGroups.filter(g => g !== group));
    } else {
      onSelectionChange([...selectedGroups, group]);
    }
  };

  const isSelected = (group: AudienceGroup) => {
    return selectedGroups.includes(group) || selectedGroups.includes('ALL');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-bmsa-text">Audience</label>
        <span className="text-xs font-medium text-bmsa-red bg-bmsa-red/10 px-2.5 py-1 rounded-full">
          {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {AUDIENCE_GROUPS.map((group) => {
          const count = getCount(group);
          const selected = isSelected(group);

          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                transition-all duration-200 border
                ${selected
                  ? group === 'ALL'
                    ? 'bg-bmsa-gold text-white border-bmsa-gold shadow-md'
                    : 'bg-bmsa-red text-white border-bmsa-red shadow-md'
                  : 'bg-white text-bmsa-text-light border-bmsa-gray-300 hover:border-bmsa-red hover:text-bmsa-red'
                }
              `}
            >
              {group}
              <span
                className={`
                  inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold
                  ${selected
                    ? 'bg-white/25 text-white'
                    : 'bg-bmsa-gray-100 text-bmsa-text-light'
                  }
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

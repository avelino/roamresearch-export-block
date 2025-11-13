import { Block } from './types';

type RoamAlphaAPI = {
  pull: (selector: string, reference: [string, string]) => any;
};

function getRoamAPI(): RoamAlphaAPI | undefined {
  return (window as typeof window & { roamAlphaAPI?: RoamAlphaAPI }).roamAlphaAPI;
}

/**
 * Retrieves a block and all its children recursively from Roam Research
 * @param blockUid The UID of the block to retrieve
 * @returns Promise resolving to the block with its children, or null if not found
 */
export async function getBlockWithChildren(blockUid: string): Promise<Block | null> {
  const roamAlphaAPI = getRoamAPI();
  if (!roamAlphaAPI) {
    console.error('Roam API is not available in this context');
    return null;
  }

  try {
    const pulledBlock = roamAlphaAPI.pull('[:block/string {:block/children ...}]', [':block/uid', blockUid]);
    if (!pulledBlock) {
      return null;
    }

    return normalizePulledBlock(pulledBlock);
  } catch (error) {
    console.error('Error in getBlockWithChildren:', error);
    return null;
  }
}

function normalizePulledBlock(pulled: any): Block {
  const content = typeof pulled?.[':block/string'] === 'string' ? pulled[':block/string'] : '';
  const rawChildren = Array.isArray(pulled?.[':block/children']) ? pulled[':block/children'] : [];

  const children: Block[] = [];
  for (const rawChild of rawChildren) {
    const normalized = resolveChildBlock(rawChild);
    if (normalized) {
      children.push(normalized);
    }
  }

  return {
    content,
    children
  };
}

function resolveChildBlock(entry: any): Block | null {
  const roamAlphaAPI = getRoamAPI();

  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    return normalizePulledBlock(entry);
  }

  const childUid = extractChildUid(entry);
  if (childUid && roamAlphaAPI) {
    try {
      const pulledChild = roamAlphaAPI.pull('[:block/string {:block/children ...}]', [':block/uid', childUid]);
      if (pulledChild) {
        return normalizePulledBlock(pulledChild);
      }
    } catch (error) {
      console.error('Error resolving child block:', error);
    }
  }

  return null;
}

function extractChildUid(entry: any): string | null {
  if (typeof entry === 'string') {
    return entry;
  }

  if (Array.isArray(entry) && entry.length > 1) {
    const candidate = entry[1];
    return typeof candidate === 'string' ? candidate : null;
  }

  if (entry && typeof entry === 'object') {
    const candidate = entry[':block/uid'] ?? entry.uid ?? entry.id;
    if (typeof candidate === 'string') {
      return candidate;
    }
  }

  return null;
}
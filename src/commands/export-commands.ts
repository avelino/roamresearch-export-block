import { ExportFormat } from '../core/types';
import { getExporter } from '../exports';
import { showToast } from '../core/notifications';

type RoamAlphaAPI = {
  ui?: {
    commandPalette?: {
      addCommand: (config: { label: string; callback: () => void }) => void;
    };
    blockContextMenu?: {
      addCommand: (config: { label: string; callback: (e?: any) => void }) => void;
    };
    getFocusedBlock?: () => { blockUid?: string } | null;
  };
};

export interface ExtensionAPI {
  ui?: {
    commandPalette?: {
      addCommand: (config: { label: string; callback: () => void }) => void;
    };
    blockContextMenu?: {
      addCommand: (config: { label: string; callback: (e?: any) => void }) => void;
    };
  };
}

/**
 * Register export commands with Roam Research
 */
export function registerExportCommands(extensionAPI?: ExtensionAPI): void {
  try {
    const roamAPI = getRoamAPI();
    const context = {
      commandPalette: extensionAPI?.ui?.commandPalette ?? roamAPI?.ui?.commandPalette,
      blockContextMenu: extensionAPI?.ui?.blockContextMenu ?? roamAPI?.ui?.blockContextMenu
    };

    // Register commands for each format
    registerSimpleCommand('Slack', context);
    registerSimpleCommand('WhatsApp', context);
    registerSimpleCommand('GoogleDocs', context);
    registerSimpleCommand('RichText', context);
  } catch (error) {
    console.error('Error registering export commands:', error);
  }
}

export function unregisterExportCommands(): void {
  console.log('🔄 Unregistering commands (simplified - no cleanup needed)');
}

/**
 * Simple command registration with minimal validation
 */
function registerSimpleCommand(format: ExportFormat, context: any): void {
  const displayName = format === 'GoogleDocs' ? 'Google Docs' : format;
  const menuLabel = `Export to ${displayName}`;
  const paletteLabel = `Export block to ${displayName}`;

  const callback = async (event?: any): Promise<void> => {
    try {
      const exporter = getExporter(format);
      const blockUid = getBlockUid(event);

      if (!blockUid) {
        // Try alternative methods to get current block
        const altBlockUid = getCurrentBlockAlternative();

        if (altBlockUid) {
          await exporter.exportBlock(altBlockUid);
          showToast(`Block exported to ${displayName} format!`, 'success');
          return;
        }

        showToast('Select a block before exporting.', 'error');
        return;
      }

      await exporter.exportBlock(blockUid);
      showToast(`Block exported to ${displayName} format!`, 'success');
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      showToast(`Error exporting to ${displayName} format`, 'error');
    }
  };

  // Register context menu command
  if (context.blockContextMenu?.addCommand) {
    try {
      context.blockContextMenu.addCommand({
        label: menuLabel,
        callback: callback
      });
    } catch (error) {
      console.error(`Failed to register context menu for ${format}:`, error);
    }
  }

  // Register command palette command
  if (context.commandPalette?.addCommand) {
    try {
      context.commandPalette.addCommand({
        label: paletteLabel,
        callback: () => callback() // No event for palette commands
      });
    } catch (error) {
      console.error(`Failed to register palette command for ${format}:`, error);
    }
  }
}

/**
 * Get block UID from event or focused block
 */
function getBlockUid(event?: any): string | undefined {
  // Try event first (from context menu) - Roam uses kebab-case properties
  if (event?.['block-uid'] || event?.['blockUid'] || event?.uid || event?.id) {
    return event['block-uid'] || event.blockUid || event.uid || event.id;
  }

  // Try focused block from Roam API
  const roamAPI = getRoamAPI();
  const focused = roamAPI?.ui?.getFocusedBlock?.();
  if (focused?.blockUid) {
    return focused.blockUid;
  }

  return undefined;
}

/**
 * Alternative methods to get current block when primary methods fail
 */
function getCurrentBlockAlternative(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  // Method 1: Check active element and traverse up to find block
  const activeElement = document.activeElement;
  if (activeElement) {
    let element: Element | null = activeElement;
    let attempts = 0;

    while (element && attempts < 10) {
      const uid = element.getAttribute('data-uid') || element.getAttribute('data-block-uid');
      if (uid) {
        return uid;
      }

      element = element.parentElement;
      attempts++;
    }
  }

  // Method 2: Look for highlighted/selected blocks
  const highlightedBlocks = document.querySelectorAll('[data-uid].block-highlight-blue, [data-uid].rm-block__focus, .rm-block--focused [data-uid]');
  if (highlightedBlocks.length > 0) {
    const uid = highlightedBlocks[0].getAttribute('data-uid');
    if (uid) {
      return uid;
    }
  }

  // Method 3: Try to find block that contains current selection
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    const blockElement = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element)
      ?.closest?.('[data-uid]');

    if (blockElement) {
      const uid = blockElement.getAttribute('data-uid');
      if (uid) {
        return uid;
      }
    }
  }

  return undefined;
}


function getRoamAPI(): RoamAlphaAPI | undefined {
  return (window as any).roamAlphaAPI;
}
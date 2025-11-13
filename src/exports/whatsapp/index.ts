import { ClipboardHandler, Exporter } from '../../core/types';
import { getBlockWithChildren } from '../../core/block-utils';
import { BaseClipboardHandler } from '../../core/clipboard-utils';
import { WhatsAppFormatter } from './formatter';

/**
 * WhatsApp-specific clipboard handler
 * WhatsApp accepts plain text with markdown-like formatting
 */
class WhatsAppClipboardHandler extends BaseClipboardHandler implements ClipboardHandler {
  /**
   * Copy text to clipboard for WhatsApp
   * @param text The text to copy
   * @returns Promise that resolves when copying is complete
   */
  async copyToClipboard(text: string): Promise<void> {
    // WhatsApp works fine with plain text, so we don't need HTML
    return super.copyToClipboard(text);
  }
}

/**
 * The WhatsApp exporter
 */
class WhatsAppExporter implements Exporter {
  formatter = new WhatsAppFormatter();
  clipboardHandler = new WhatsAppClipboardHandler();

  /**
   * Export a block to WhatsApp format
   * @param blockId The ID of the block to export
   * @returns Promise that resolves when export is complete
   */
  async exportBlock(blockId: string): Promise<void> {
    try {
      // Get block with children
      const block = await getBlockWithChildren(blockId);
      if (!block) {
        console.error('No block found');
        throw new Error('Block not found');
      }

      // Format the block
      const formattedText = this.formatter.format(block);

      // Copy to clipboard
      await this.clipboardHandler.copyToClipboard(formattedText);

    } catch (error) {
      console.error('Error exporting to WhatsApp:', error);
      throw error;
    }
  }
}

// Create and export the WhatsApp exporter instance
export const whatsappExporter = new WhatsAppExporter();
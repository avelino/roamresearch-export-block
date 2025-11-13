import { ClipboardHandler, Exporter } from '../../core/types';
import { getBlockWithChildren } from '../../core/block-utils';
import { BaseClipboardHandler, markdownToHtml } from '../../core/clipboard-utils';
import { SlackFormatter } from './formatter';

/**
 * Slack-specific clipboard handler with HTML support
 */
class SlackClipboardHandler extends BaseClipboardHandler implements ClipboardHandler {
  /**
   * Copy text to clipboard with Slack-specific HTML formatting
   * @param text The text to copy
   * @returns Promise that resolves when copying is complete
   */
  async copyToClipboard(text: string): Promise<void> {
    // Convert to HTML for better formatting in Slack
    const html = markdownToHtml(text);

    // Use the base class implementation with HTML
    return super.copyToClipboard(text, html);
  }
}

/**
 * The Slack exporter
 */
class SlackExporter implements Exporter {
  formatter = new SlackFormatter();
  clipboardHandler = new SlackClipboardHandler();

  /**
   * Export a block to Slack format
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
      console.error('Error exporting to Slack:', error);
      throw error;
    }
  }
}

// Create and export the Slack exporter instance
export const slackExporter = new SlackExporter();
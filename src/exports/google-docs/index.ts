import { ClipboardHandler, Exporter } from '../../core/types';
import { getBlockWithChildren } from '../../core/block-utils';
import { BaseClipboardHandler, markdownToHtml } from '../../core/clipboard-utils';
import { GoogleDocsFormatter } from './formatter';

/**
 * Google Docs-specific clipboard handler with HTML support
 */
class GoogleDocsClipboardHandler extends BaseClipboardHandler implements ClipboardHandler {
  /**
   * Copy text to clipboard with Google Docs-specific HTML formatting
   * @param text The text to copy
   * @returns Promise that resolves when copying is complete
   */
  async copyToClipboard(text: string): Promise<void> {
    // Convert to HTML for better formatting in Google Docs
    const html = markdownToHtml(text);

    // Use the base class implementation with HTML
    return super.copyToClipboard(text, html);
  }
}

/**
 * The Google Docs exporter
 */
class GoogleDocsExporter implements Exporter {
  formatter = new GoogleDocsFormatter();
  clipboardHandler = new GoogleDocsClipboardHandler();

  /**
   * Export a block to Google Docs format
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
      console.error('Error exporting to Google Docs:', error);
      throw error;
    }
  }
}

// Create and export the Google Docs exporter instance
export const googleDocsExporter = new GoogleDocsExporter();
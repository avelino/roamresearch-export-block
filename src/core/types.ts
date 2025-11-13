/**
 * Basic types used throughout the project
 */

/**
 * Represents a Roam Research block with its content and children
 */
export interface Block {
  content: string;
  children: Block[];
}

/**
 * Available export formats
 */
export type ExportFormat = 'Slack' | 'WhatsApp' | 'GoogleDocs' | 'RichText';

/**
 * Interface for formatters that convert blocks to formatted text
 */
export interface BlockFormatter {
  /**
   * Convert a block and its children to formatted text
   * @param block The block to convert
   * @param level Indentation level (for nested blocks)
   * @returns Formatted text
   */
  format(block: Block, level?: number): string;
}

/**
 * Interface for clipboard handlers
 */
export interface ClipboardHandler {
  /**
   * Copy text to clipboard with format-specific enhancements
   * @param text The text to copy
   * @returns Promise that resolves when copying is complete
   */
  copyToClipboard(text: string): Promise<void>;
}

/**
 * Complete export handler for a specific format
 */
export interface Exporter {
  /**
   * The formatter for this export type
   */
  formatter: BlockFormatter;

  /**
   * The clipboard handler for this export type
   */
  clipboardHandler: ClipboardHandler;

  /**
   * Export a block to this format
   * @param blockId The ID of the block to export
   * @returns Promise that resolves when export is complete
   */
  exportBlock(blockId: string): Promise<void>;
}
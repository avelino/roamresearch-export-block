import { Block, BlockFormatter } from '../../core/types';

/**
 * Formatter for Google Docs-compatible text
 */
export class GoogleDocsFormatter implements BlockFormatter {
  /**
   * Convert a block to Google Docs-friendly format
   * @param block The block to convert
   * @param level Indentation level
   * @returns Formatted text for Google Docs
   */
  format(block: Block, level: number = 0): string {
    let result = '';
    const content = block.content.trim();

    // Format indentation for nested levels
    let indent = '';
    for (let i = 0; i < level; i++) {
      indent += '  ';
    }

    // Process content
    if (!content) {
      return '';
    } else if (content === '---') {
      return `${indent}---\n`;
    }

    // Clean up Roam wiki-style syntax
    let formattedContent = content;

    // Convert wiki-style links [[text]] to just text
    formattedContent = formattedContent.replace(/\[\[(.*?)\]\]/g, '$1');

    // Convert TODO to checkbox
    formattedContent = formattedContent.replace(/TODO\s/g, '□ ');

    // Keep other formatting as-is
    // Google Docs generally handles standard markdown well when pasted

    // Add bullet or indentation
    result = `${indent}• ${formattedContent}\n`;

    // Process children
    if (block.children && block.children.length > 0) {
      for (const child of block.children) {
        result += this.format(child, level + 1);
      }
    }

    return result;
  }
}
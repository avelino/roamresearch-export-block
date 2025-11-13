import { Block, BlockFormatter } from '../../core/types';

/**
 * Formatter for WhatsApp-compatible text
 */
export class WhatsAppFormatter implements BlockFormatter {
  /**
   * Convert a block to WhatsApp-friendly format
   * @param block The block to convert
   * @param level Indentation level
   * @returns Formatted text for WhatsApp
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

    // Bold: Convert **text** to *text* (WhatsApp uses asterisks)
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '*$1*');

    // Italic: Convert __text__ or _text_ to _text_ (WhatsApp uses underscores)
    formattedContent = formattedContent.replace(/__(.*?)__/g, '_$1_');

    // Strikethrough: Convert ~~text~~ to ~text~ (WhatsApp uses tildes)
    formattedContent = formattedContent.replace(/\~\~(.*?)\~\~/g, '~$1~');

    // Links: Keep as is - WhatsApp shows URLs plainly

    // Add bullet or indentation
    if (level === 0) {
      result = `• ${formattedContent}\n`;
    } else {
      result = `${indent}• ${formattedContent}\n`;
    }

    // Process children
    if (block.children && block.children.length > 0) {
      for (const child of block.children) {
        result += this.format(child, level + 1);
      }
    }

    return result;
  }
}
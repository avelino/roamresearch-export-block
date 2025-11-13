import { ExportFormat, Exporter } from '../core/types';
import { slackExporter } from './slack';
import { whatsappExporter } from './whatsapp';
import { googleDocsExporter } from './google-docs';

/**
 * Get the appropriate exporter for the given format
 * @param format The export format to use
 * @returns The exporter for the specified format
 */
export function getExporter(format: ExportFormat): Exporter {
  switch (format) {
    case 'Slack':
      return slackExporter;
    case 'WhatsApp':
      return whatsappExporter;
    case 'GoogleDocs':
      return googleDocsExporter;
    case 'RichText':
      // For RichText, we'll reuse the Slack exporter with different processing
      return slackExporter;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export {
  slackExporter,
  whatsappExporter,
  googleDocsExporter
};
import { registerExportCommands, unregisterExportCommands, ExtensionAPI } from './commands/export-commands';

let initialized = false;

interface OnloadArgs {
  extensionAPI?: ExtensionAPI;
}

async function onload(args: OnloadArgs = {}): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    // Wait a bit for Roam API to be fully ready
    await new Promise(resolve => setTimeout(resolve, 100));

    registerExportCommands(args.extensionAPI);
    initialized = true;
  } catch (error) {
    console.error('Plugin initialization failed:', error);
  }
}

function onunload(): void {
  unregisterExportCommands();
  initialized = false;
}

const extension = {
  onload,
  onunload
};

export default extension;

// Remove auto-bootstrap - let Roam handle it via onload
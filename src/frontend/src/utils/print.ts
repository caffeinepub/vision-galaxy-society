/**
 * Opens a print-friendly view in a new window/tab
 */
export function openPrintView(path: string): void {
  window.open(path, '_blank');
}

/**
 * Triggers the browser print dialog
 * Call this after the print view has loaded
 */
export function triggerPrint(): void {
  window.print();
}

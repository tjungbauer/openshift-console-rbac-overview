/**
 * @file k8sClientError.ts
 * Extract readable message from dynamic-plugin-sdk k8s errors.
 */
export function k8sClientErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const message = (error as { message?: string }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    const reason = (error as { reason?: string }).reason;
    if (typeof reason === 'string' && reason.length > 0) {
      return reason;
    }
  }
  return String(error);
}

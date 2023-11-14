export type WorkerResultPayload = {
  status: 'success' | 'error';
  errorMessage?: string;
};

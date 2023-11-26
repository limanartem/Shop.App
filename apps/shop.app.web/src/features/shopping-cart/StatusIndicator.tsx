import { Chip } from '@mui/material';

const statusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'shipped':
      return 'info';
    case 'delivered':
      return 'success';
    default:
      return 'default';
  }
};

export function StatusIndicator({ status }: { status?: string }) {
  return <Chip label={status} color={statusColor(status)} size="small" style={{ fontSize: '0.75rem'}} />;
}

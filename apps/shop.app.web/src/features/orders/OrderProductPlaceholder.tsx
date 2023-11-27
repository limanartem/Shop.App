import { Stack, Skeleton, Box } from '@mui/material';

export function OrderProductPlaceholder() {
  return (
    <Stack sx={{ width: '100%', display: 'flex', height: 35,  alignItems: 'center' }} direction="row" spacing={1}>
      <Skeleton variant="rounded" sx={{ height: '80%', width: 50 }} />
      <Skeleton sx={{ flex: '1 1', height: '30%' }}/>
    </Stack>
  );
}

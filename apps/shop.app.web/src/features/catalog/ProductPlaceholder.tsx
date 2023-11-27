import { Stack, Skeleton, Box } from '@mui/material';

export function ProductPlaceholder() {
  return (
    <Stack sx={{ width: '100%', display: 'flex', height: 150 }} direction="row" spacing={1}>
      <Skeleton variant="rounded" sx={{ width: 150, height: '100%' }} />
      <Box sx={{ flex: '1 1', height: '100%' }}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton height={80} />
      </Box>
    </Stack>
  );
}

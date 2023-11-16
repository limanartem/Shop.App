import { Typography } from '@mui/material';

export function DateTime({ date }: { date: Date }) {
  const d = new Date(date);

  return (
    <>
      {d.toLocaleDateString()} {d.toLocaleTimeString()}
    </>
  );
}

export function DateTime({ date }: { date: Date }) {
  const d = new Date(date);

  return (
    <>
      {d.toLocaleDateString()} {d.toLocaleTimeString(undefined, { timeStyle: 'short' })}
    </>
  );
}

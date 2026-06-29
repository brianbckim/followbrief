export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-md border border-line bg-slate-950 p-3 text-xs leading-5 text-slate-100">
      {JSON.stringify(value ?? null, null, 2)}
    </pre>
  );
}

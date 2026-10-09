// `href` with one query parameter set (or removed when `value` is null); path, other parameters and hash stay.
export function withParam(href: string, name: string, value: string | null): string {
  const url = new URL(href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  return url.toString();
}

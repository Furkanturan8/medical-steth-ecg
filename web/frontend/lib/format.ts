export function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("tr-TR")
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("tr-TR")
}

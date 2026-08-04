import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { djangoFetchJson } from "@/lib/api"
import { formatDate } from "@/lib/format"
import type { Paginated, Patient } from "@/types/api"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page = "1", q = "" } = await searchParams

  const query = new URLSearchParams({ page })
  if (q) query.set("search", q)
  const data = await djangoFetchJson<Paginated<Patient>>(`/api/recordings/v1/patients/?${query}`)
  const patients = data.results

  const pageNum = Number(page)
  const withQuery = (p: number) => `/?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hastalar</h1>
        <Button render={<Link href="/patients/new" />}>Yeni Hasta</Button>
      </div>

      <form className="mt-4 max-w-sm">
        <Input type="search" name="q" placeholder="Hasta ara..." defaultValue={q} />
      </form>

      {patients.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          {q ? "Aramayla eşleşen hasta yok." : "Henüz hasta eklenmedi."}
        </p>
      ) : (
        <>
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Doğum Tarihi</TableHead>
                <TableHead>Eklenme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Link href={`/patients/${patient.id}`} className="font-medium hover:underline">
                      {patient.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                  <TableCell>{formatDate(patient.created)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.count} hasta</span>
            <div className="flex gap-2">
              {data.previous && (
                <Button variant="outline" size="sm" render={<Link href={withQuery(pageNum - 1)} />}>
                  Önceki
                </Button>
              )}
              {data.next && (
                <Button variant="outline" size="sm" render={<Link href={withQuery(pageNum + 1)} />}>
                  Sonraki
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

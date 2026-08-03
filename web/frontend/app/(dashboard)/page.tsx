import Link from "next/link"

import { Button } from "@/components/ui/button"
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
import type { Patient } from "@/types/api"

export default async function DashboardPage() {
  const patients = await djangoFetchJson<Patient[]>("/api/recordings/v1/patients/")

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hastalar</h1>
        <Button render={<Link href="/patients/new" />}>Yeni Hasta</Button>
      </div>

      {patients.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Henüz hasta eklenmedi.</p>
      ) : (
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
      )}
    </div>
  )
}

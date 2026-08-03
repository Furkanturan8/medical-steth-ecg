import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { djangoFetch, djangoFetchJson } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type { PatientDetail, RecordingListItem } from "@/types/api"

import { TrendSparkline } from "./trend-sparkline"
import { UploadRecordingForm } from "./upload-recording-form"

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  done: "Tamamlandı",
  failed: "Hata",
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const patientRes = await djangoFetch(`/api/recordings/v1/patients/${id}/`)
  if (patientRes.status === 404) notFound()
  const patient: PatientDetail = await patientRes.json()

  const recordings = await djangoFetchJson<RecordingListItem[]>(
    `/api/recordings/v1/recordings/?patient=${id}`,
  )

  // Oldest → newest, only completed analyses have numbers to trend.
  const withAnalysis = [...recordings]
    .filter((r) => r.analysis_status === "done" && r.heart_rate_bpm != null)
    .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{patient.full_name}</h1>
        {patient.notes && <p className="mt-1 text-muted-foreground">{patient.notes}</p>}
      </div>

      <div>
        <h2 className="text-lg font-medium">Kayıtlar</h2>
        {recordings.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Henüz kayıt yüklenmedi.</p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Dosya</TableHead>
                <TableHead>Yüklenme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Kalp Hızı</TableHead>
                <TableHead>Sistol</TableHead>
                <TableHead>Diyastol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordings.map((recording) => (
                <TableRow key={recording.id}>
                  <TableCell>
                    <Link href={`/recordings/${recording.id}`} className="font-medium hover:underline">
                      {recording.original_filename}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(recording.created)}</TableCell>
                  <TableCell>
                    <Badge variant={recording.analysis_status === "failed" ? "destructive" : "secondary"}>
                      {STATUS_LABELS[recording.analysis_status ?? "pending"]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {recording.heart_rate_bpm != null ? `${recording.heart_rate_bpm.toFixed(0)} bpm` : "—"}
                  </TableCell>
                  <TableCell>
                    {recording.mean_systole_ms != null ? `${recording.mean_systole_ms.toFixed(0)} ms` : "—"}
                  </TableCell>
                  <TableCell>
                    {recording.mean_diastole_ms != null ? `${recording.mean_diastole_ms.toFixed(0)} ms` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {withAnalysis.length >= 2 && (
        <div>
          <h2 className="text-lg font-medium">Zaman İçinde Değişim</h2>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            <TrendSparkline
              title="Kalp Hızı (bpm)"
              unit="bpm"
              color="var(--chart-1)"
              points={withAnalysis.map((r) => ({ date: r.created, value: r.heart_rate_bpm! }))}
            />
            <TrendSparkline
              title="Sistol (ms)"
              unit="ms"
              color="var(--chart-2)"
              points={withAnalysis.map((r) => ({ date: r.created, value: r.mean_systole_ms! }))}
            />
            <TrendSparkline
              title="Diyastol (ms)"
              unit="ms"
              color="var(--chart-3)"
              points={withAnalysis.map((r) => ({ date: r.created, value: r.mean_diastole_ms! }))}
            />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium">Yeni Kayıt Yükle</h2>
        <UploadRecordingForm patientId={patient.id} />
      </div>
    </div>
  )
}

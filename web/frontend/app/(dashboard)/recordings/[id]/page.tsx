import { notFound } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { djangoFetch } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type { RecordingDetail } from "@/types/api"

import { PrintButton } from "./print-button"

export default async function RecordingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const res = await djangoFetch(`/api/recordings/v1/recordings/${id}/`)
  if (res.status === 404) notFound()
  const recording: RecordingDetail = await res.json()
  const analysis = recording.analysis

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{recording.original_filename}</h1>
          <p className="text-muted-foreground">{formatDateTime(recording.created)}</p>
        </div>
        {analysis?.status === "done" && <PrintButton />}
      </div>

      {!analysis || analysis.status === "pending" ? (
        <p className="text-muted-foreground">Analiz bekleniyor...</p>
      ) : analysis.status === "failed" ? (
        <p className="text-destructive">Analiz başarısız oldu: {analysis.error_message}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Kalp Hızı" value={`${analysis.heart_rate_bpm?.toFixed(0)} bpm`} />
            <SummaryCard label="Sistol" value={`${analysis.mean_systole_ms?.toFixed(0)} ms`} />
            <SummaryCard label="Diyastol" value={`${analysis.mean_diastole_ms?.toFixed(0)} ms`} />
          </div>

          {analysis.report_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={analysis.report_image} alt="PCG raporu" className="w-full rounded border" />
          )}

          {analysis.filtered_audio_file && (
            <div className="print:hidden">
              <p className="mb-2 text-sm text-muted-foreground">Filtrelenmiş ses</p>
              <audio controls src={analysis.filtered_audio_file} className="w-full" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

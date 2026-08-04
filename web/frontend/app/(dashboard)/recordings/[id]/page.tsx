import { notFound } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { djangoFetch } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type { RecordingDetail } from "@/types/api"

import { DeleteRecordingButton } from "./delete-recording-button"
import { PrintButton } from "./print-button"
import { RetryAnalysisButton } from "./retry-analysis-button"

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
        <div className="flex gap-2">
          {analysis?.status === "done" && <PrintButton />}
          <DeleteRecordingButton recordingId={recording.id} patientId={recording.patient} />
        </div>
      </div>

      {!analysis || analysis.status === "pending" ? (
        <p className="text-muted-foreground">Analiz bekleniyor...</p>
      ) : analysis.status === "failed" ? (
        <div className="space-y-3">
          <p className="text-destructive">Analiz başarısız oldu: {analysis.error_message}</p>
          <RetryAnalysisButton recordingId={recording.id} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard label="Kalp Hızı" value={`${analysis.heart_rate_bpm?.toFixed(0)} bpm`} />
            <SummaryCard label="Sistol" value={`${analysis.mean_systole_ms?.toFixed(0)} ms`} />
            <SummaryCard label="Diyastol" value={`${analysis.mean_diastole_ms?.toFixed(0)} ms`} />
            <SummaryCard
              label="Tespit"
              value={`${analysis.s1_timestamps_sec.length} S1 / ${analysis.s2_timestamps_sec.length} S2`}
            />
          </div>

          {analysis.report_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={analysis.report_image} alt="PCG raporu" className="w-full rounded border" />
          )}

          <div className="grid gap-4 print:hidden md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Ham ses</p>
              <audio controls src={recording.audio_file} className="w-full" />
            </div>
            {analysis.filtered_audio_file && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Filtrelenmiş ses</p>
                <audio controls src={analysis.filtered_audio_file} className="w-full" />
              </div>
            )}
          </div>
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

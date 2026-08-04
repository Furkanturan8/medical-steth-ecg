"use client"

import { useActionState } from "react"

import { uploadRecordingAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UploadRecordingForm({ patientId }: { patientId: number }) {
  const action = uploadRecordingAction.bind(null, patientId)
  const [error, formAction, isPending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="mt-2 max-w-md space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="audio_file">Ses dosyası (WAV)</Label>
          <Input id="audio_file" name="audio_file" type="file" accept="audio/wav,.wav" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recorded_at">Kayıt tarihi (opsiyonel)</Label>
          <Input id="recorded_at" name="recorded_at" type="datetime-local" />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Yükleniyor ve analiz ediliyor..." : "Yükle"}
      </Button>

      {isPending && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted" role="status" aria-label="Yükleniyor">
          <div className="h-full w-1/3 animate-[upload-progress_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      )}
    </form>
  )
}

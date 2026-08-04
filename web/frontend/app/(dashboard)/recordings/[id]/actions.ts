"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { djangoFetch } from "@/lib/api"

export async function retryAnalysisAction(recordingId: number) {
  const res = await djangoFetch(`/api/recordings/v1/recordings/${recordingId}/retry_analysis/`, {
    method: "POST",
  })
  if (!res.ok) {
    throw new Error("Analiz tekrar başlatılamadı.")
  }
  revalidatePath(`/recordings/${recordingId}`)
}

export async function deleteRecordingAction(recordingId: number, patientId: number) {
  const res = await djangoFetch(`/api/recordings/v1/recordings/${recordingId}/`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Kayıt silinemedi.")
  }
  revalidatePath(`/patients/${patientId}`)
  redirect(`/patients/${patientId}`)
}

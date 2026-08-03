"use server"

import { revalidatePath } from "next/cache"

import { djangoFetch } from "@/lib/api"

export async function uploadRecordingAction(
  patientId: number,
  _prevState: string | undefined,
  formData: FormData,
) {
  const file = formData.get("audio_file")
  if (!(file instanceof File) || file.size === 0) {
    return "Lütfen bir ses dosyası seçin."
  }

  const body = new FormData()
  body.set("patient", String(patientId))
  body.set("audio_file", file)

  const res = await djangoFetch("/api/recordings/v1/recordings/", {
    method: "POST",
    body,
  })

  if (!res.ok) {
    return "Kayıt yüklenemedi. Lütfen tekrar deneyin."
  }

  revalidatePath(`/patients/${patientId}`)
}

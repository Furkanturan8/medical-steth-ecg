"use server"

import { redirect } from "next/navigation"

import { djangoFetch } from "@/lib/api"

export async function updatePatientAction(
  patientId: number,
  _prevState: string | undefined,
  formData: FormData,
) {
  const fullName = formData.get("full_name")
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return "Ad soyad zorunlu."
  }

  const res = await djangoFetch(`/api/recordings/v1/patients/${patientId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      full_name: fullName,
      date_of_birth: formData.get("date_of_birth") || null,
      notes: formData.get("notes") ?? "",
    }),
  })

  if (!res.ok) {
    return "Hasta güncellenemedi. Lütfen tekrar deneyin."
  }

  redirect(`/patients/${patientId}`)
}

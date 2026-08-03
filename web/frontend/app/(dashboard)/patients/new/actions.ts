"use server"

import { redirect } from "next/navigation"

import { djangoFetchJson } from "@/lib/api"
import type { Patient } from "@/types/api"

export async function createPatientAction(_prevState: string | undefined, formData: FormData) {
  const fullName = formData.get("full_name")
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return "Ad soyad zorunlu."
  }

  let patient: Patient
  try {
    patient = await djangoFetchJson<Patient>("/api/recordings/v1/patients/", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: formData.get("date_of_birth") || null,
        notes: formData.get("notes") ?? "",
      }),
    })
  } catch {
    return "Hasta kaydedilemedi. Lütfen tekrar deneyin."
  }

  redirect(`/patients/${patient.id}`)
}

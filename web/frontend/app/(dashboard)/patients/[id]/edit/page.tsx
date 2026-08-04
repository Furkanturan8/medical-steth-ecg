import { notFound } from "next/navigation"

import { djangoFetch } from "@/lib/api"
import type { PatientDetail } from "@/types/api"

import { EditPatientForm } from "./edit-patient-form"

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await djangoFetch(`/api/recordings/v1/patients/${id}/`)
  if (res.status === 404) notFound()
  const patient: PatientDetail = await res.json()

  return (
    <div>
      <h1 className="text-2xl font-semibold">Hastayı Düzenle</h1>
      <EditPatientForm patient={patient} />
    </div>
  )
}

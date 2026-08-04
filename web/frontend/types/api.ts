export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

export interface Patient {
  id: number
  full_name: string
  date_of_birth: string | null
  created: string
}

export interface PatientDetail extends Patient {
  notes: string
  created_by: number | null
  modified: string
}

export type AnalysisStatus = "pending" | "done" | "failed"

export interface AnalysisResult {
  status: AnalysisStatus
  heart_rate_bpm: number | null
  mean_systole_ms: number | null
  mean_diastole_ms: number | null
  s1_timestamps_sec: number[]
  s2_timestamps_sec: number[]
  report_image: string | null
  filtered_audio_file: string | null
  error_message: string
  computed_at: string | null
}

export interface RecordingListItem {
  id: number
  patient: number
  original_filename: string
  duration_sec: number | null
  recorded_at: string | null
  created: string
  analysis_status: AnalysisStatus | null
  heart_rate_bpm: number | null
  mean_systole_ms: number | null
  mean_diastole_ms: number | null
}

export interface RecordingDetail {
  id: number
  patient: number
  uploaded_by: number | null
  audio_file: string
  original_filename: string
  recorded_at: string | null
  sample_rate_hz: number | null
  duration_sec: number | null
  created: string
  analysis: AnalysisResult | null
}

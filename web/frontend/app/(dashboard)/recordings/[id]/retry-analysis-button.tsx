"use client"

import { useTransition } from "react"

import { retryAnalysisAction } from "./actions"
import { Button } from "@/components/ui/button"

export function RetryAnalysisButton({ recordingId }: { recordingId: number }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(async () => await retryAnalysisAction(recordingId))}
    >
      {isPending ? "Tekrar deneniyor..." : "Analizi Tekrar Dene"}
    </Button>
  )
}

"use client"

import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
      Yazdır / PDF Olarak Kaydet
    </Button>
  )
}

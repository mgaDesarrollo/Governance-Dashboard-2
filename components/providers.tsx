"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { setDefaultOptions } from "date-fns"
import { enUS } from "date-fns/locale"

export function Providers({ children }: { children: ReactNode }) {
  // Ensure date-fns defaults to English everywhere
  setDefaultOptions({ locale: enUS })

  return <SessionProvider>{children}</SessionProvider>
}

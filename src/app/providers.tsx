// app/providers.tsx
'use client'

import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";
import { SessionProvider } from "@/components/SessionProvider";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
          <ToastProvider />
          {children}
      </HeroUIProvider>
    </SessionProvider>
  )
}
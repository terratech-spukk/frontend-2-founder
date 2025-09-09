// app/providers.tsx
'use client'

import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";
import { SessionProvider } from "@/components/SessionProvider";
import { CartProvider } from "@/contexts/CartContext";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        <CartProvider>
          <ToastProvider />
          {children}
        </CartProvider>
      </HeroUIProvider>
    </SessionProvider>
  )
}
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Loader2 } from 'lucide-react'

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="animate-slide-up mb-8 flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <img src="/logo.png" alt="Logo" className="h-28 w-auto mx-auto drop-shadow-2xl mb-4" />
            <p className="text-sm text-muted-foreground">Painel de Controle</p>
          </div>
        </Link>

        <div className="animate-slide-up rounded-xl border border-border bg-card p-6" style={{ animationDelay: '0.3s' }}>

          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm">
                Username or Email
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                required
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-border bg-secondary text-foreground"
              />
            </div>

            {state?.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </div>


      </div>
    </div>
  )
}

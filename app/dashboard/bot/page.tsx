'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Bot, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BotPage() {
    const { data: settings, error, mutate, isLoading } = useSWR('/api/settings', fetcher)
    const [token, setToken] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (settings?.discord_bot_token) {
            setToken(settings.discord_bot_token)
        }
    }, [settings])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'discord_bot_token', value: token }),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast.success('Token do bot salvo com sucesso!')
            mutate({ ...settings, discord_bot_token: token }, false)
        } catch (err) {
            toast.error('Erro ao salvar o token')
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
                <CardContent className="p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex items-start gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20">
                            <Bot className="h-7 w-7 text-[#5865F2]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">Discord Bot Token</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                                Token do bot para buscar nome e avatar dos usuários nas licenças.
                                Armazenado com segurança no servidor.
                            </p>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-3">
                        <Label htmlFor="token" className="text-sm font-medium text-muted-foreground">
                            Token
                        </Label>
                        <div className="relative group">
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="MTIzNDU2Nz... (Seu Token do Discord)"
                                className="bg-background/50 border-border focus-visible:ring-primary h-12 rounded-xl transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Action Section */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Salvar
                    </Button>
                </CardContent>
            </Card>

            {/* Hint Card */}
            <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Dica: Certifique-se de que o bot tenha a permissão de ver membros ativada no portal do desenvolvedor.
            </div>
        </div>
    )
}

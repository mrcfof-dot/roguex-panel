'use client'

import useSWR from 'swr'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Power, PlayCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SettingsPage() {
    const { data: settings, error, mutate, isLoading } = useSWR('/api/settings', fetcher)

    const updateSetting = async (key: string, value: boolean) => {
        // Optimistic update
        const newSettings = { ...settings, [key]: String(value) }
        mutate(newSettings, false)

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            })

            if (!res.ok) throw new Error('Failed to update')
            toast.success('Configuração atualizada!')
            mutate()
        } catch (err) {
            toast.error('Erro ao salvar configuração')
            mutate() // Revert
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    const serviceStatus = settings?.service_status === 'true'
    const maintenanceMode = settings?.maintenance_mode === 'true'

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Controle do Aplicativo</h1>
                <p className="text-sm text-muted-foreground">
                    Controle global do estado do aplicativo
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Service Status Card */}
                <Card className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10`}>
                                <Power className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Status do Serviço</h3>
                                <p className="text-sm text-muted-foreground">{serviceStatus ? 'Online' : 'Offline'}</p>
                            </div>
                        </div>
                        <Switch
                            checked={serviceStatus}
                            onCheckedChange={(checked) => updateSetting('service_status', checked)}
                            className="data-[state=checked]:bg-primary"
                        />
                    </CardContent>
                </Card>

                {/* Maintenance Mode Card */}
                <Card className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10`}>
                                <PlayCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Modo Manutenção</h3>
                                <p className="text-sm text-muted-foreground">{maintenanceMode ? 'Ativado' : 'Desativado'}</p>
                            </div>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                            className="data-[state=checked]:bg-primary"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Simple hardcoded check as requested by user
    if ((email === 'admin@roguex.com' && password === '123') ||
        (email === 'roguex' && password === '123') ||
        (email === 'insano' && password === 'insanocapa') ||
        (email === 'mrcrlq' && password === '1964f')) {

        // Set a simple session cookie
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const cookieStore = await cookies()

        cookieStore.set('roguex_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
        })

        redirect('/dashboard')
    }

    return {
        error: 'Invalid credentials.',
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('roguex_session')
    redirect('/login')
}

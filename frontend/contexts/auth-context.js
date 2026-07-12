"use client"

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})
const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "https://datahub.dream10.in"
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token');
        setUser(token)
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await fetch(`${apiBackend}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            localStorage.setItem('token', data.token)
            setUser(data.token)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const register = async (email, password, name) => {
        try {
            const response = await fetch(`${apiBackend}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed')
            }

            localStorage.setItem('token', data.token)
            setUser(data.token)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
import { useState } from 'react'

export function useAuth() {
  // Por enquanto, vamos assumir que está sempre autenticado
  return {
    isAuthenticated: true,
    isLoading: false
  }
} 
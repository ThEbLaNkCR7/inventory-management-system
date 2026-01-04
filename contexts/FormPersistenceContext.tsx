"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface FormData {
  [key: string]: any
}

interface FormPersistenceContextType {
  getFormData: (formId: string) => FormData | null
  setFormData: (formId: string, data: FormData) => void
  clearFormData: (formId: string) => void
  clearAllFormData: () => void
  hasFormData: (formId: string) => boolean
}

const FormPersistenceContext = createContext<FormPersistenceContextType | undefined>(undefined)

export function FormPersistenceProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormDataState] = useState<{ [key: string]: FormData }>({})

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('formPersistenceData')
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormDataState(parsed)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formPersistenceData', JSON.stringify(formData))
  }, [formData])

  const getFormData = (formId: string): FormData | null => {
    return formData[formId] || null
  }

  const setFormData = (formId: string, data: FormData) => {
    setFormDataState(prev => ({
      ...prev,
      [formId]: data
    }))
  }

  const clearFormData = (formId: string) => {
    setFormDataState(prev => {
      const newData = { ...prev }
      delete newData[formId]
      return newData
    })
  }

  const clearAllFormData = () => {
    setFormDataState({})
  }

  const hasFormData = (formId: string): boolean => {
    return !!formData[formId]
  }

  return (
    <FormPersistenceContext.Provider value={{
      getFormData,
      setFormData,
      clearFormData,
      clearAllFormData,
      hasFormData
    }}>
      {children}
    </FormPersistenceContext.Provider>
  )
}

export function useFormPersistence() {
  const context = useContext(FormPersistenceContext)
  if (context === undefined) {
    throw new Error('useFormPersistence must be used within a FormPersistenceProvider')
  }
  return context
}

// Custom hook for form persistence
export function usePersistentForm<T extends FormData>(
  formId: string,
  initialData: T
) {
  const { getFormData, setFormData, clearFormData } = useFormPersistence()
  
  const [formState, setFormState] = useState<T>(() => {
    const savedData = getFormData(formId)
    return savedData ? { ...initialData, ...savedData } : initialData
  })

  const updateForm = (updates: Partial<T>) => {
    const newData = { ...formState, ...updates }
    setFormState(newData)
    setFormData(formId, newData)
  }

  const resetForm = () => {
    setFormState(initialData)
    clearFormData(formId)
  }

  const clearForm = () => {
    setFormState(initialData)
    clearFormData(formId)
  }

  return {
    formData: formState,
    updateForm,
    resetForm,
    clearForm
  }
} 
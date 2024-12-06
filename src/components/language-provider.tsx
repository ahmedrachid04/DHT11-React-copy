import { createContext, useContext, useState } from 'react'
import { IntlProvider } from 'use-intl'
import translations from '../translations/index.ts'

export type Language = 'fr'

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageProviderState = {
  language: Language
  setLanguage: (lang: Language) => void
}

const initialState: LanguageProviderState = {
  language: 'fr',
  setLanguage: () => null,
}

const LanguageProviderContext =
  createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,

  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('fr')

  const value = {
    language,
    setLanguage: (lang: Language) => {
      setLanguage(lang)
    },
  }

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      <IntlProvider locale={language} messages={translations[language]}>
        {children}
      </IntlProvider>
    </LanguageProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider')

  return context
}

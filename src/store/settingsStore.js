import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ACCENT_PRESETS = {
  sky:     { label: '스카이',   value: '#5BA3CF', hover: '#4A8CB8', soft: 'rgba(91,163,207,0.12)'  },
  ocean:   { label: '오션',     value: '#2D7DD2', hover: '#2268B8', soft: 'rgba(45,125,210,0.12)'  },
  violet:  { label: '바이올렛', value: '#7C3AED', hover: '#6D28D9', soft: 'rgba(124,58,237,0.12)'  },
  teal:    { label: '틸',       value: '#0D9488', hover: '#0B7C75', soft: 'rgba(13,148,136,0.12)'  },
  forest:  { label: '포레스트', value: '#059669', hover: '#047857', soft: 'rgba(5,150,105,0.12)'   },
  rose:    { label: '로즈',     value: '#E11D48', hover: '#BE123C', soft: 'rgba(225,29,72,0.12)'   },
  slate:   { label: '슬레이트', value: '#475569', hover: '#334155', soft: 'rgba(71,85,105,0.12)'   },
}

export { ACCENT_PRESETS }

const applyTheme = (theme, accentKey) => {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)

  const preset = ACCENT_PRESETS[accentKey] || ACCENT_PRESETS.sky
  root.style.setProperty('--accent',       preset.value)
  root.style.setProperty('--accent-hover', preset.hover)
  root.style.setProperty('--accent-soft',  preset.soft)
}

const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      accentKey: 'sky',
      fontSize: 'default',
      density: 'comfortable',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme, get().accentKey)
      },

      setAccent: (accentKey) => {
        set({ accentKey })
        applyTheme(get().theme, accentKey)
      },

      setFontSize: (fontSize) => {
        set({ fontSize })
        const sizes = { small: '13px', default: '14px', large: '15px' }
        document.documentElement.style.setProperty('--font-size-base', sizes[fontSize] || '14px')
      },

      setDensity: (density) => set({ density }),

      applyAll: () => {
        const { theme, accentKey, fontSize } = get()
        applyTheme(theme, accentKey)
        const sizes = { small: '13px', default: '14px', large: '15px' }
        document.documentElement.style.setProperty('--font-size-base', sizes[fontSize] || '14px')
      },
    }),
    { name: 'portfolio-settings' }
  )
)

export default useSettingsStore

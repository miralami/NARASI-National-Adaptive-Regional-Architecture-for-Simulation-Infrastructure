/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // NARASI policy-laboratory palette (IMPLEMENTATION_MASTERPLAN §7)
        brand: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
          violet: '#8B5CF6',
        },
        // Dark slate base
        abyss: '#0F172A',
        panel: '#1E293B',
        edge: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 18px rgba(6, 182, 212, 0.35)',
        'glow-violet': '0 0 18px rgba(139, 92, 246, 0.35)',
      },
    },
  },
  plugins: [],
};

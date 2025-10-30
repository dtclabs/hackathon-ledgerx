module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    boxShadow: {
      custom: ' 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      wallet: '0px 0px 0px 4px rgba(242, 244, 247, 0.8), 0px 4px 12px 0px rgba(16, 24, 40, 0.04)',
      avvvatar: '0px 0px 0px 2px #ffffff',
      buttonFocusPurple: '0px 4px 12px rgba(0, 0, 25, 0.04), 0px 0px 0px 3px rgba(47, 44, 255, 0.3)',
      inputField: '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    },
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite'
      },
      grayscale: {
        90: '90%'
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(50% 50% at 50% 50%, #454545 0%, rgba(0, 0, 0, 0) 100%)',
        faded: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 40.73%)',
        sidebar: 'linear-gradient(90deg, #D0D5DD 0%, rgba(208, 213, 221, 0) 100%)',
        'transfer-default': 'linear-gradient(360deg, #D0D5DD 0%, rgba(208, 213, 221, 0) 100%)',
        'transfer-active': 'linear-gradient(360deg, #E83F6D 0%, rgb(232, 63, 109, 0) 100%)'
      },
      spacing: { 448: '-448px' },
      flex: { 3: '30% 0 0', 4: '0 0 100%' },
      width: {
        transaction: '896px',
        halfScreen: '50vw',
        searchBar: '592px',
        headerDashboard: 'calc(100vw - 290px)',
        safeLeft: '445px',
        wallet: '562px',
        safeRight: 'calc(100vw - 445px)',
        sideModal: '448px',
        addWorkFlowSpace: 'calc(100vw - 362px)',
        createTemplateMainview: 'calc(100% - 290px)'
      },
      height: {
        body: 'calc(100% - 4rem)',
        dashboardMainView: 'calc(100vh - 65px)',
        homeMainView: 'calc(100vh - 70px)',
        homeView: 'calc(100vh - 80px)',
        contentView: 'calc(100vh - 80px)'
      },
      maxHeight: {
        homeMainView: 'calc(100vh - 70px)',
        paymentMainView: 'calc(100vh - 80px)',
        reviewModal: 'calc(90vh - 220px)'
      },
      fontFamily: {
        inter: "'Inter', sans-serif",
        modes: "'Modes'",
        supply: 'Supply',
        epilogue: "'Epilogue', sans-serif"
      },
      boxShadow: {
        '3xl': '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        '4xl': '0px 4px 20px rgba(0, 0, 0, 0.25)',
        searchbar: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        sideModal: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'workflow-item': '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        'add-workflow-header': '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'primary-blue-button': '0px 1px 2px rgba(0, 0, 0, 0.05)',
        'free-modal': '0px 16px 48px -16px rgba(0, 0, 0, 0.02), 0px 0px 80px rgba(0, 0, 0, 0.02)',
        tooltip: '0px 16px 32px -8px rgba(0, 0, 0, 0.04), 0px 8px 32px 0px rgba(0, 0, 0, 0.08)',
        'home-modal': '0px 4px 12px rgba(16, 24, 40, 0.04)',
        textFieldRecipient: '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)',
        keyboard: '0 0 0 1px rgb(234, 236, 240), 0 3px 0 0 rgb(234, 236, 240)',
        'keyboard-enter': '0 0 0 1px rgb(248, 195, 210), 0 3px 0 0 rgb(248, 195, 210)',
        button: '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)',
        card: '0px 16px 32px -8px rgba(0, 0, 0, 0.04)',
        'card-2': '0px 16px 48px -16px rgba(0, 0, 0, 0.02), 0px 0px 80px rgba(0, 0, 0, 0.02)',
        loading: '0px 8px 32px rgba(0, 0, 0, 0.08), 0px 16px 32px -8px rgba(0, 0, 0, 0.04)'
      },
      maxWidth: {
        sidebar: '72rem',
        '1/2': '50%',
        '4/5': '80%'
      },
      minWidth: {
        '1/2': '50%',
        '4/5': '80%'
      },
      zIndex: {
        9: 9,
        behind: '-1'
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // primary: '#303B50',
        'primary-yellow': '#FFCE00',
        'secondary-gray': '#F9FAFB',
        'third-gray': '#E5E7EB',
        'primary-blue': '#0EA5E9',
        'light-blue-900': '#1798D2',
        'light-blue-800': '#0369A1',
        'light-blue-700': '#E0F2FE',
        'light-blue-300': '#7DD3FC',
        'light-blue-200': '#BAE6FD',
        'primary-pink': '#2D2D2C',
        'remove-icon': '#F3F5F7',
        pink: {
          100: '#EF1A61',
          200: '#2D2D2C', // This is black I have no clue why it is called pink
          300: 'rgba(232, 64, 109, 0.6)',
          500: '#E83F6D'
        },

        black: {
          0: '#000000',
          19: '#000019',
          70: 'rgba(0, 0, 0, 0.7)',
          200: '#2D2D2C'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#718096',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          1000: '#4B5563',
          light: '#787878',
          10: '#DDE2E7',
          1100: '#899098',
          1200: '#F3F5F7',
          1300: '#F3F5F6'
        },
        indigo: {
          50: '#EEF2FF',
          500: '#6366F1',
          6: '#00006B'
        },
        grey: {
          20: 'rgba(0, 0, 0, 0.7)',
          50: '#787878',
          100: '#FBFAFA',
          200: '#F1F1EF',
          201: '#dededc',
          400: '#98A2B3',
          700: '#777675',
          800: '#535251',
          900: '#101828',
          901: '#1f2e4d'
        },
        neutral: {
          100: '#f2f4f7',
          300: '#D0D5DD',
          900: '#2D2D2C'
        },
        blue: {
          100: '#ebf8ff',
          200: '#bee3f8',
          300: '#90cdf4',
          400: '#63b3ed',
          500: '#4299e1',
          600: '#3182ce',
          700: '#2b6cb0',
          800: '#2c5282',
          900: '#2a4365'
        },
        green: {
          100: '#10B981'
        },
        blanca: {
          50: '#FDFDFD',
          100: '#FBFAFA',
          300: '#E2E2E0',
          400: '#CECECC',
          600: '#989796',
          800: '#535251'
        },
        modal: '#E0E0E0',
        'input-border': '#D1D5DB',
        backgroundImage: {
          circle: 'radial-gradient(#D1D5DB 20%, #F3F4F6 20%)'
        },
        dashboard: {
          darkMain: '#101828',
          main: '#344054',
          sub: '#667085',
          background: '#F2F4F7',
          border: '#EBEDEF',
          'border-200': '#EAECF0',
          'hover-active': '#FDECF0'
        },
        success: '#0BA740',
        warning: {
          50: '#FDF1E7',
          500: '#E9740B',
          600: '#D46A0A'
        },
        error: {
          50: '#F9E8E8',
          200: '#E59494',
          500: '#C61616',
          700: '#8D1010'
        },
        white: '#FFFFFF'
      },

      transitionProperty: {
        height: 'height, padding',
        spacing: 'margin, padding',
        width: 'width, padding'
      }
    },
    screens: {
      custom1600x900: { max: '1600px', maxHeight: '900px' },
      'min-xl': { min: '1029px' },
      '3xl': { max: '1600px' },
      '2xl': { max: '1535px' },
      laptop: { max: '1440px' },
      macbock: { max: '1367px' },
      // => @media (max-width: 1535px) { ... }
      xl: { max: '1280px' },
      // => @media (max-width: 1279px) { ... }
      lg: { max: '1023px' },
      // => @media (max-width: 1023px) { ... }
      md: { max: '767px' },
      // => @media (max-width: 767px) { ... }
      sm: { max: '639px' }
      // => @media (max-width: 639px) { ... }
    }
  },
  plugins: [require('tailwindcss-animate')],
  output: {
    globalObject: 'this'
  }
}

import '../src/styles/globals.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

const withTheme = (Story) => {
  return (
    <div className="font-inter">
      <Story />
    </div>)
}

export const decorators = [withTheme]
const { defineConfig } = require('cypress')
const dotenv = require('dotenv')
dotenv.config()

module.exports = defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      console.log(config) // see everything in here!

      // modify config values
      config.defaultCommandTimeout = 10000
      config.baseUrl = 'http://localhost:3000'

      console.log(process.env)
      // modify env var value
      config.env.ENVIRONMENT = 'dev'
      config.supportFile = 'cypress/support/e2e.js'
      config.chromeWebSecurity = true

      const metamask = require('cypress-metamask/cypress/plugins')
      metamask(on, config)

      // IMPORTANT return the updated config object
      return config
    }
  }
})

('path')

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: { importLoaders: 1 }
              },
              {
                loader: 'postcss-loader',
                options: { implementation: require.resolve('postcss') }
              }
            ]
          }
        ]
      }
    }
  ],

  framework: {
    name: '@storybook/nextjs',
    // options: { builder: { useSWC: true } } - Only works on NextJS 14+
  },

  webpackFinal: (config) => {
    // config.module.rules.push({
    //   test: /\.css$/i,
    //   use: [
    //     'postcss-loader'
    //   ],
    //   include: path.resolve(__dirname, '../')
    // })
    // config.resolve = {
    //   ...config.resolve,
    //   fallback: {
    //     ...(config.resolve || {}).fallback,

    //     stream: false,

    //   },
    // }
    // Return the altered config
    return config
  },

  docs: {
    autodocs: true
  }
}

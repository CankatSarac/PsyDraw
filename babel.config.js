module.exports = {
    presets: [
      'next/babel',
      '@babel/preset-flow'
    ],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      ['react-native-web', { commonjs: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
    ],
  };
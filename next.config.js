/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      '@react-native-async-storage/async-storage': 'react-native-web/dist/exports/AsyncStorage',
      'react-native-gesture-handler': 'react-native-web/dist/exports/GestureResponderHandler',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    
    // Add __DEV__ global variable
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        process: { env: {} },
      })
    );

    return config;
  },
  // Disable server-side rendering for React Native components
  experimental: {
    serverActions: true,
    serverComponents: false,
  },
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    '@react-navigation/stack',
    'react-native-safe-area-context',
    'react-native-gesture-handler',
    '@react-native-async-storage/async-storage',
  ],
};

module.exports = nextConfig; 
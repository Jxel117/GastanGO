const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('cjs');
// AQUÍ AGREGAMOS EL SOPORTE PARA PDF
defaultConfig.resolver.assetExts.push('pdf');

module.exports = defaultConfig;
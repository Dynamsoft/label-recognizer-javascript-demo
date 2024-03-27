const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    publicPath: process.env.VUE_APP_PUBLIC_PATH,//"./",
    configureWebpack: config=>{ 
        if(config.mode === "production"){
            config.devtool = false;

            config.plugins.push(
                new CompressionWebpackPlugin({
                    exclude: /(\.config)$/,
                }),
            );

            config.plugins.push(
                new BundleAnalyzerPlugin({
                  analyzerMode: 'disabled', 
                  generateStatsFile: false, 
                  deleteOriginalAssets: true
                }),
            );
            
            config.plugins.push(
                new UglifyJsPlugin({
                  uglifyOptions: {
                    output: {
                      comments: false,
                  },
                  compress: {
                    drop_debugger: true,
                    drop_console: true, 
                  },
                  },
                  parallel: true,
                })
            );

            config.externals = {
                'clipboard': 'ClipboardJS',
                'dynamsoft-camera-enhancer': 'Dynamsoft.DCE',
                'dynamsoft-label-recognizer': 'Dynamsoft.DLR',
                'dynamsoft-code-parser': 'Dynamsoft.DCP',
                'dynamsoft-core': 'Dynamsoft.Core',
                'dynamsoft-license': 'Dynamsoft.License',
            };
        }
    },

    chainWebpack: config => {
        config.plugins.delete('preload');
        config.plugins.delete('prefetch');
        config.optimization.minimize(true);
    },
    productionSourceMap: false,
}
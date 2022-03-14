const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer; 

module.exports = {
    publicPath: "./",
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
                new PrerenderSPAPlugin({
                    staticDir: path.join(__dirname, 'dist'),
            
                    routes: [ '/' ],
                    renderer: new Renderer({
                    inject: {
                        foo: 'bar'
                    },
                    headless: true,
                    renderAfterDocumentEvent: 'render-event'
                    })
                })
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
                'dynamsoft-label-recognizer': 'Dynamsoft.DLR'
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
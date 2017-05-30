var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
var FaviconsWebpackPlugin = require('favicons-webpack-plugin');
var Visualizer = require('webpack-visualizer-plugin');
var bootstrapEntryPoints = require('./webpack.bootstrap.config.js');
const glob = require('glob');
const PurifyCSSPlugin = require('purifycss-webpack');

const isProd = process.env.NODE_ENV === 'production'; //true or false
const cssIdentifier = isProd ? 'purify_[hash:base64:10]' : '[path][name]---[local]';
const cssDev = ['style-loader', 'css-loader?modules&localIdentName=' + cssIdentifier, 'sass-loader', 'postcss-loader'];
const cssProd = ExtractTextPlugin.extract({
        use: ['css-loader?modules&minimize=true&localIdentName=' + cssIdentifier,  'sass-loader', 'postcss-loader']
});

const cssConfig = isProd ? cssProd : cssDev;

const bootstrapConfig = isProd ? bootstrapEntryPoints.prod : bootstrapEntryPoints.dev;
var plugins = {
    commons: [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./build/vendor-manifest.json'),
        }),
        new HTMLWebpackPlugin({
            template: './index-template.html',
            // commons should be included before app, 
            // but html webpack plugin will take care of this.
            chunks: ['app', 'commons', 'bootstrap'], // select the entry items to include
            minify: {
                collapseWhitespace: isProd
            }
         }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons'
        }),
        new AddAssetHtmlPlugin({
            includeSourcemap: !isProd,
            hash: true,
            filepath: require.resolve('./build/vendor.dll.js'),
        }),
        new Visualizer()
    ],
    prod: [
        new webpack.DefinePlugin({
            "process.env": { 
                NODE_ENV: JSON.stringify("production") 
            }
        }),
        new ExtractTextPlugin({
            filename: 'css/[name]-style-[contenthash:10].css',
            disable: !isProd,
            allChunks: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            //comments: true,
            //mangle: false,
            compress: {
               warnings: false,
               drop_console: true,
               drop_debugger: true
            }
        }),
         // Make sure this is after ExtractTextPlugin!
        new PurifyCSSPlugin({
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync(path.join(__dirname, './*.html')).concat(
                glob.sync(path.join(__dirname, './src/**/*.js'))
            ),
            minimize: true,
            moduleExtensions: ['.js'], //An array of file extensions for determining used classes within node_modules
            purifyOptions: {
                whitelist: ['*purify*']
            }
        }),
        new FaviconsWebpackPlugin('./my-logo.jpg')
    ],
    dev: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ]
};

module.exports = {
    entry: {
        // According to HtmlWebpackPlugin config, it's possible that 
        // not all entry chunks are included into index.html
        app: ['./src/index.js'],
        about: './src/about.js',
        bootstrap: bootstrapConfig,
        commons: ['react', 'react-dom']
    },
//  externals: {
//      'jquery': 'jQuery'
//  },
    devtool: 'source-map',
    plugins: plugins.commons.concat(isProd ? plugins.prod : plugins.dev),
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: isProd ? '[name].bundle.[hash:12].min.js' : '[name].bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, './'),
        compress: true,
        port: 9000,
        open: true,
        hot: true,
        stats: 'errors-only'
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: ['babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.(png|jpg|gif)$/,
            use: ['url-loader?limit=216000&name=images/[hash:12].[ext]'],
            exclude: /node_modules/
        }, {
            test: /\.(css|scss)$/,
            use: cssConfig,
            exclude: /node_modules/
        }, { 
            test: /\.(woff2?|svg)$/, 
            loader: 'url-loader?limit=10000&name=fonts/[name].[ext]' 
        }, { 
            test: /\.(ttf|eot)$/, 
            loader: 'file-loader?name=fonts/[name].[ext]' 
        }, { 
            test:/bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/, 
            loader: 'imports-loader?jQuery=jquery' 
        },]
    }
};

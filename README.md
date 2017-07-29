# Inject Assets Webpack Plugin

This is a simple but powerful webpack plugin which allows you to inject any webpack-related data to any project files.

## Installation

```
npm install --save-dev inject-assets-webpack-plugin
```

## Basic usage

Imagine you have bundle with hashed js files and you would like to cache them with service worker. 
To activate new service worker on rebuild you can also inject webpack build hash into service worker.

`public/serviceWorker.js` example:

```javascript
// {hash}

var myHostname = '{hostname}';
var filesToCache = '{bundleFiles}';
...
```

```javascript
var config = require('you-app-config.json');
var InjectAssetsWebpackPlugin = require('inject-assets-webpack-plugin');

var webpackConfig = {
  entry: {
    app: ['./src/app.js'],
    vendor: [
      'react',
      'react-dom',
      'redux',
      'react-redux'
    ],
  },
  output: {
    path: path.join(__dirname, '/public/'),
    filename: 'js/[name].[chunkhash].js',
    publicPath: '/'
  },
  plugins: [
    new InjectAssetsWebpackPlugin({
      filename: 'public/serviceWorker.js'
    },[
      {
        pattern: '{hash}',
        type: 'hash'
      },
      {
        pattern: '{hostname}',
        type: 'value',
        value: config.hostname
      },
      {
        pattern: '{bundleFiles}',
        type: 'chunks',
        chunks: ['app', 'vendor'],
        files: ['.js', '.css'],
        excludeFiles: ['.map'],
        decorator: function(fileNames) {
          return fileNames.join('\', \'');
        } 
      }
    ]),
    ...
  ]
};
```

You can also inject js and css files into html. It is better to use another plugin like `html-webpack-plugin`, but if 
you prefer full control of a process you can use `inject-assets-webpack-plugin`

`public/index.html` example:

```html
<head>
  %styles%
</head>
<body>
...

  %scripts%
</body>
```

```javascript
  plugins: [
    new InjectAssetsWebpackPlugin({
      filename: 'public/index.html'
    },[
      {
        pattern: '%styles%',
        type: 'chunks',
        chunks: ['app'],
        files: ['.css'],
        excludeFiles: ['.map'],
        decorator: function(fileNames) {
          return fileNames.reduce(function(output, fileName) {
            return output + '<link href="' + fileName + '" rel="stylesheet">';
          }, '');
        }
      },
      {
        pattern: '%scripts%',
        type: 'chunks',
        chunks: ['app', 'vendor'],
        files: ['.js'],
        excludeFiles: ['.map'],
        decorator: function(fileNames) {
          return fileNames.reduce(function(output, fileName) {
            return output + '<script type="text/javascript" src="' + fileName + '"></script>';
          }, '');
        }
      }
    ]),
    ...
  ]
```

## Plugin specification

`new InjectAssetsWebpackPlugin(options, [replacements])`

`options` object has the following properties:

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `filename` | `string` | `index.html` in output webpack dir | Path to a file which content should be replaced. Can be related to project root or absolute. |
| `event` | `string` | `done` | Webpack plugin event hook name which handles replacement. Can be one of `done`, `compile`, `emit`. |

each `replacement` object has the following properties:

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `pattern` | `string` or `RegExp` | **none** | Search pattern. All found entries will be replaced by replacement. |
| `type` | `string` | `chunks` | Define the replacement type. Can be one of<br>`hash` - found entries will be replaced by webpack build hash,<br>`value` - found entries will be replaced by the following value,<br>`chunks` - found entries will be replaced by matched asset chunks file names. |
| `value` | `string` or `number` | **none** | Used only for `value` type. Defines replacement value. |
| `chunks` | `array` | all chunks | Used only for `chunks` type. Defines a list of webpack chunks names processed by plugin. Use all chunks if not specified. |
| `excludeChunks` | `array` | **none** | Used only for `chunks` type. Defines a list of webpack chunks names excluded from processing by plugin. |
| `files` | `string` or `RegExp` | **none** | Used only for `chunks` type. Only files matched by that puttern will be used as replacement.  |
| `excludeFiles` | `string` or `RegExp` | **none** | Used only for `chunks` type. All files matched by that puttern will be excluded from replacement. |
| `decorator` | `function(array)` | **none** | Used only for `chunks` type. Used to decorate replacement file names |

## Licence

MIT
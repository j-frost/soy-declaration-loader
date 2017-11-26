# soy-declaration-loader

This project lets you use .soy-file templates from [Google Closure](https://developers.google.com/closure/templates/) projects in [TypeScript](http://www.typescriptlang.org/) projects using [webpack](https://webpack.js.org/) without giving up the many benefits of TypeScripts strong type system. Basically, this loader will generate typings for the soy templates.

## Getting Started

Simply install via NPM: 

```
npm install --save-dev soy-declaration-loader
```

Then, configure your webpack to load .soy files using soy-declaration-loader: 

```
  module: {
    loaders: [
      {
        test: /\.soy$/,
        include: [
          path.resolve(__dirname, './src/main/resources/soy')
        ],
        loader: 'soy-declaration-loader'
      }
    ]
  }
```

This will make them available from TypeScript at compile time.

## Contributing

If you want to help develop, please make sure the tests don't break. Check out this repository and run the tests with `npm run test`.

Also, when contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change. 

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/j-frost/soy-declaration-loader/tags). 

## License

This project is licensed under the Unlicense - see the [LICENSE.md](LICENSE.md) file for details.

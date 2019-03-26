# razor-vue-lint

Make Eslint work with .NET Razor views that contain inlined Vue templates.
Wraps Razor expressions with marker blocks that are ignored by ES Lint, so that the ES linter only lints the Vue templates in the file.

## Razor expressions supported

Currently it supports:

- expressions terminated by newline `\n`
- expressions terminated by closing tag `</`
- expressions inside enclosing `'` (JS strings or HTML attributes)

## How it works

The "raw" `.cshtml` file:

```cshtml
@using EPiServer.Core
@using EPiServer.Web.Mvc.Html
@using Olympus.Core.Models.Blocks.Subscription
@model  Olympus.Core.ViewModels.BlockViewModelBase<SubscriptionOfferingsBlock>

<subscription-offerings inline-template>
  <div class="ss-grid ss-grid--no-gutter ss-c-offering ss-c-subscription-offerings-possible-subscriptions">
    <div class="ss-c-page-title ss-c-subscription-page-title ss-grid__col--md-10 ss-grid__col--md-offset-1 ss-grid__col--xs-10 ss-grid__col--xs-offset-1">
         <p>@Html.PropertyFor(m => m.CurrentBlock.Heading)</h2>&nbsp;<p>@Html.PropertyFor(m => m.CurrentBlock.Subtext)</p>
    </div>
  </div>
</subscription-offerings>
```

Should be transformed into an equally valid `.cshtml` file with the Razor expressions escaped

```cshtml
/* eslint-disable */
@using EPiServer.Core
@using EPiServer.Web.Mvc.Html
@using Olympus.Core.Models.Blocks.Subscription
@model  Olympus.Core.ViewModels.BlockViewModelBase<SubscriptionOfferingsBlock>
/* eslint-enable */
<subscription-offerings inline-template>
  <div class="ss-grid ss-grid--no-gutter ss-c-offering ss-c-subscription-offerings-possible-subscriptions">
    <div class="ss-c-page-title ss-c-subscription-page-title ss-grid__col--md-10 ss-grid__col--md-offset-1 ss-grid__col--xs-10 ss-grid__col--xs-offset-1">
      <p>
      /* eslint-disable */
      @Html.PropertyFor(m => m.CurrentBlock.Heading)</h2>&nbsp;<p>@Html.PropertyFor(m => m.CurrentBlock.Subtext)
      /* eslint-enable */
      </p>
    </div>
  </div>
</subscription-offerings>
```

We aim to support some the most common expression types. The rest
must for now be added "by hand" or you can make PRs to include them.

Note that this lib is not battle-tested so there a likely many scenarios not catered for.
Keep your Razor expressions and views simple!

## Usage

The library exports the function `addIgnoreEsLintBlocksForRazorExpressions`, which takes a single string argument containing the code to be transformed. The function returns the transformed string, with razor expressions contained inside blocks ignored by ES lint.

```js
const { addIgnoreEsLintBlocksForRazorExpressions } = require("razor-vue-lint");

// TODO: load cshtml file into a string called code

const lintEscapedCode = addIgnoreEsLintBlocksForRazorExpressions(code);

// TODO: write escaped cshtml file to a file
```

You will need to write a script to recursively process your code files (see below).

Then you can setup eslint to lint the cshtml files using your Vue configuration of preference and it should skip most of the sections Razor expressions, now inside "ignore blocks", between:

- `/* eslint-disable */`
- `/* eslint-enable */`

## Traverse

WIP: _not tested_

You can now use traverse functionality to:

- recursively traverse files in a folder tree
- process each file matching a criteria such as file extension
- execute the function to insert es-lint escape block on Razor expressions
- save transformed content to either a new file or overwriting original

```js
const path = require("path");
const traverse = require("razor-vue-lint");
const { processFiles } = traverse;

const folder = path.join(__dirname, "MyProject");
const onSuccess = result => {
  console.log("DONE");
};

processFiles({ folder, onSuccess });
```

### Advanced usage

In this example we add a custom filter function `fileFilter` to process any file with `.cs` as part of the file extension at the end of the file name. We also pass in a custom function `destFilePathOf` to calculate to destination file path to write each transformed file to.

In addition we pass in the usual suspects: `folder` and `onSuccess` with `errorFn` a custom error handler.

```js
const traverse = require("razor-vue-lint");
const { processFiles } = traverse;

const path = require("path");
const folder = path.join(__dirname, "MyProject");
const onSuccess = result => {
  console.log(result);
};

const opts = {
  folder,
  onSuccess,
  destFilePathOf: filePath => filePath + ".lint",
  fileFilter: filePath => filePath.match(/\.cs\w+$/),
  errorFn: err => throw err
};
processFiles({ folder, onSuccess });
```

See `traverse.js` source for more configuration options. You can also use the internal functions to easily compose custom traverse/transform functionality.

## Linting

Resources

- [Vue ESLint user guide](https://eslint.vuejs.org/user-guide/)
- [Configuring eslint-plugin-vue](https://alligator.io/vuejs/vue-eslint-plugin/#installation)
- [Running from command line](https://eslint.vuejs.org/user-guide/#running-eslint-from-command-line)

Install es-lint Vue plugin

```bash
# Yarn
$ yarn eslint eslint-plugin-vue --save-dev
# NPM
$ npm install eslint eslint-plugin-vue --save-dev
```

Update (or create) your `.eslintrc.json` file.

```json
{
  "extends": ["eslint:recommended", "plugin:vue/recommended"]
}
```

The full eslint configuration might look something like this:

```json
{
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "parser": "babel-eslint"
  },
  "extends": ["airbnb-base", "plugin:vue/recommended"],
  "rules": {}
}
```

Many of the issues detected by those rules can be automatically fixed with eslint’s `--fix` option.

The CLI targets only `.js` files by default. You have to specify additional extensions by `--ext` option or glob patterns. E.g. `eslint "src/**/*.{js,vue}"` or `eslint src --ext .vue`

To lint .NET server generated `.cshtml` files, use something like:

`eslint **/*.cshtml.lintable`

### Integrated tooling

We can have process all the `.cshtml` files and save each processed file with an additional `.lintable`
extension to be linted.

```js
const opts = {
  folder,
  destFilePathOf: filePath => filePath + ".lintable",
  fileFilter: filePath => filePath.match(/\.cshtml$/),
  errorFn: err => throw err
};
processFiles({ folder, onSuccess });
```

Create a file `scripts/make-vue-razor-views-lintable.js`

```js
const traverse = require("razor-vue-lint");
const { processFiles } = traverse;

const path = require("path");
const minimist = require('minimist');
const processArgs = process.argv.slice(2);
const opts = {
  alias: {
    h: 'help',
    s: 'src',
    e: 'ext'
  }
};

// args is an object, with key for each named argument
const args = minimist(processArgs, opts);
const defaults = {
  srcFolder: "./",
  ext: 'lintable'
}
if (args.help) {
  console.log(`
format-cs
---------
  -s src folder (default: ./ )
  -e lintable file extension (default: lintable)
`)
  process.exit(0);
}
const srcFolder = args.src || defaults.srcFolders;
const fileExt = args.ext || defaults.ext;
const rootPath = path.join(__dirname, "..");
const srcPath = path.join(rootPath, srcFolder),

const opts = {
  folder,
  destFilePathOf: filePath => filePath + `.${fileExt}`,
  fileFilter: filePath => filePath.match(/\.cshtml$/),
  errorFn: err => throw err
};
processFiles({ folder, onSuccess });
```

#### Cleanup after linting

Cleanup (remove) the `.lintable` files after linting.

[Windows](https://superuser.com/questions/546213/remove-folders-maching-pattern-recursively-in-windows) `> del /s /q *.lintable`
[Unix](https://unix.stackexchange.com/questions/116389/recursively-delete-all-files-with-a-given-extension) `$ find . -type f -name '*.lintable' -delete`

## Pre-commit hooks

You can use this recipe to integrate this linting process with git hooks, such as pre-commit hooks:

- Setup git hooks via husky
- Create node script to trigger on hook
- Setup hooks
- Install and setup husky

Add the following to your `package.json` file (or create a new one using `npm init`)

```json
{
  "devDependencies": {
    "narrange": "~1.0.0"
    "husky": "~1.3.1"
  },
  "husky": {
    "hooks": {
      "pre-commit": "node scripts/lint-views.js"
    }
  }
}
```

#### Lint views

Create a `scripts/lint-views.js` (or some other script) file which should:

- run `node make-vue-razor-views-lintable.js` to create lintable version of your view files
- run `eslint **/*.cshtml.lintable` to lint the lintable files and print linting errors
- cleanup `.lintable` files so they are not committed

### VS Code

To configure linting vue files in VS Code:

Go to _File_ > _Preferences_ > _Settings_ and add this to your user settings JSON file:

```json
"eslint.validate": [
    "javascript",
    "javascriptreact",
    {
        "language": "vue",
        "autoFix": false
    }
],
```

It is highly recommended to install the VS Code extension: [eslint-disable-snippets](https://marketplace.visualstudio.com/items?itemName=drKnoxy.eslint-disable-snippets)

With this extension, you can be at or above a line you want to disable, and start typing `eslint-disable` and usually VS Code’s auto-complete suggestions will kick up after you type even just `esl`.

## Testing

We are using [jest](https://jestjs.io) for unit testing.

### Testing traverse

To mock the file system for testing traverse, we are using [memFs](https://github.com/streamich/memfs)

See `traverse.test.js` for traverse tests. Currently using a variant of `recursive-readdir` which allows passing in a custom `fs` (file system object) to be used. This approach works well to make `memFs` (in-memory file system) work with Jest.

See the `test/data` for testing infrastructure, such as fake file system setup and test files.

You can add `debug: true` as an option to enable debug tracing.

#### memfs

`vol` is an instance of `Volume` constructor, it is the default volume created for your convenience.
`fs` is an fs-like object created from vol using `createFsFromVolume(vol)`.

#### Alternative file mocking

- [jest-plugin-fs](https://www.npmjs.com/package/jest-plugin-fs)
- [mock-fs](npmjs.com/package/mock-fs)

## License

MIT

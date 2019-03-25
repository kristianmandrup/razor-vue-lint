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

## License

MIT

```

```

```

```

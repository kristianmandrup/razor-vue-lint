# razor-vue-lint

[![Greenkeeper badge](https://badges.greenkeeper.io/kristianmandrup/razor-vue-lint.svg)](https://greenkeeper.io/)

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

You will need to write a script to recursively process your code files.

Then you can setup eslint to lint the cshtml files using your Vue configuration of preference and it should skip most of the sections Razor expressions, now inside "ignore blocks", between:

- `/* eslint-disable */`
- `/* eslint-enable */`

## License

MIT

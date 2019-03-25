const folder = "/app";
const cshtmlFile = `@using Olympus.Core.Models.Blocks.Subscription
      @model  Olympus.Core.ViewModels.BlockViewModelBase<SubscriptionOfferingsBlock>     
      <subscription inline-template>
        <div class="ss-grid ss-grid--no-gutter ss-c-offering ss-c-subscription-offerings-possible-subscriptions">
          <div class="ss-c-page-title ss-c-subscription-page-title ss-grid__col--md-10 ss-grid__col--md-offset-1 ss-grid__col--xs-10 ss-grid__col--xs-offset-1">
              <h2>@Html.PropertyFor(m => m.CurrentBlock.Heading)</h2>&nbsp;<p>@Html.PropertyFor(m => m.CurrentBlock.Subtext)</p>
        </div>
      </subscription>`;

module.exports = {
  cshtmlFile,
  folder
};

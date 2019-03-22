const {
  matchText,
  exprs,
  replaceAll,
  replace
} = require("./eslint-escape-razor-exprs");

describe("matchText", () => {
  describe("empty text", () => {
    test("no matches", () => {
      const matches = matchText("");
      expect(matches).toBe(null);
    });
  });

  describe("single Razor expression line", () => {
    const txt = "@using EPiServer.Core\n";
    const matches = matchText(exprs.line, txt);
    test("has matches", () => {
      expect(matches).not.toBe(null);
      expect(matches.length).toBe(1);
    });

    test("group 1", () => {
      expect(matches[0]).toEqual("@using EPiServer.Core\n");
    });

    describe("replacer", () => {
      const replaced = replace.inLine(txt);
      // console.log({ replaced });
      test("replace works", () => {
        const expectedLine =
          "/* eslint-disable */\n@:using EPiServer.Core\n/* eslint-enable */\n";
        expect(replaced).toEqual(expectedLine);
      });
    });
  });

  describe("single Razor expression line in tag", () => {
    const txt = `<strong v-if="offering.hasUnlimitedData">@Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)</strong>`;
    const matches = matchText(exprs.inTag, txt);
    test("has matches", () => {
      expect(matches).not.toBe(null);
      expect(matches.length).toBe(1);
    });

    test("group 1", () => {
      expect(matches[0]).toEqual(
        "@Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)</"
      );
    });

    describe("replacer: tag", () => {
      const replaced = replace.inTag(txt);
      // console.log({ replaced });
      test("replace works", () => {
        const expectedTag =
          '<strong v-if="offering.hasUnlimitedData">/* eslint-disable */\n@:Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)/* eslint-enable */</strong>';
        expect(replaced).toEqual(expectedAttrib);
      });
    });
  });

  describe("single Razor expression line in attribute", () => {
    const txt = `v-on:click.prevent="handleOfferingSelect(offering, '@(Model.CurrentBlock.ConfirmButtonLink?.ID)')"`;
    const matches = matchText(exprs.inAttribute, txt);
    // console.log({ matches });
    test("has matches", () => {
      expect(matches).not.toBe(null);
      expect(matches.length).toBe(1);
    });

    test("group 1", () => {
      expect(matches[0]).toEqual(
        `'@(Model.CurrentBlock.ConfirmButtonLink?.ID)'`
      );
    });

    describe("replacer: attribute", () => {
      const replaced = replace.inAttribute(txt);
      // console.log({ replaced });
      test("replace works", () => {
        const expectedAttrib = `v-on:click.prevent="handleOfferingSelect(offering, '/* eslint-disable */\n@(Model.CurrentBlock.ConfirmButtonLink?.ID)/* eslint-enable */')"`;
        expect(replaced).toEqual(expectedAttrib);
      });
    });
  });

  describe("Multiple Razor expression lines", () => {
    const txt = "@using EPiServer.Core\n@using EPiServer.Web.Mvc.Html\n";
    const matches = matchText(exprs.line, txt);
    test("has matches", () => {
      expect(matches).not.toBe(null);
      expect(matches.length).toBe(2);
    });

    test("group 1", () => {
      expect(matches[0]).toEqual("@using EPiServer.Core\n");
    });
    test("group 2", () => {
      expect(matches[1]).toEqual("@using EPiServer.Web.Mvc.Html\n");
    });

    describe("replacer: lines", () => {
      const replaced = replace.inLine(txt);
      // console.log({ replaced, txt });
      test("replace works", () => {
        const expectedLines =
          "/* eslint-disable */\n@:using EPiServer.Core\n/* eslint-enable */\n/* eslint-disable */\n@:using EPiServer.Web.Mvc.Html\n/* eslint-enable */\n";
        expect(replaced).toEqual();
      });
    });
  });

  describe.only("Various Razor expression", () => {
    const tag = `<strong v-if="offering.hasUnlimitedData">@Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)</strong>`;
    const attrib = `v-on:click.prevent="handleOfferingSelect(offering, '@(Model.CurrentBlock.ConfirmButtonLink?.ID)')"`;
    const lines = "@using EPiServer.Core\n@using EPiServer.Web.Mvc.Html\n";
    const txt = [tag, lines, attrib].join("\n");

    const expected = {
      line:
        "/* eslint-disable */\n@using EPiServer.Core\n/* eslint-enable */\n",
      lines:
        "/* eslint-disable */\n@using EPiServer.Core\n@:using EPiServer.Web.Mvc.Html\n/* eslint-enable */\n",
      attrib: `v-on:click.prevent="handleOfferingSelect(offering, '/* eslint-disable */\n@(Model.CurrentBlock.ConfirmButtonLink?.ID)/* eslint-enable */')"`,
      tag:
        '<strong v-if="offering.hasUnlimitedData">/* eslint-disable */\n@Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)/* eslint-enable */</strong>'
    };

    // const allExpectedGen = [expected.tag, expected.lines, expected.attrib].join(
    //   "\n"
    // );

    const allExpected = `<strong v-if="offering.hasUnlimitedData">/* eslint-disable */\n@Html.PropertyFor(m => m.CurrentBlock.UnlimitedDataLabel)/* eslint-enable */</strong>\n/* eslint-disable */\n@using EPiServer.Core\n@using EPiServer.Web.Mvc.Html\n/* eslint-enable */\nv-on:click.prevent="handleOfferingSelect(offering, '/* eslint-disable */\n@(Model.CurrentBlock.ConfirmButtonLink?.ID)/* eslint-enable */')"\n`;

    describe("replacer: all", () => {
      const replaced = replaceAll(txt);
      // console.log({ replaced, txt });
      test("replace works", () => {
        expect(replaced).toEqual(allExpected);
      });
    });
  });
});

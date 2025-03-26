// config.js 

(function(window) {
    const Config = {
        // prettier 설정정
        prettierConfig : {
            arrowParens: "always",
            bracketSameLine: false,
            objectWrap: "preserve",
            bracketSpacing: true,
            semi: true,
            experimentalOperatorPosition: "end",
            experimentalTernaries: false,
            singleQuote: true,
            jsxSingleQuote: false,
            quoteProps: "as-needed",
            trailingComma: "all",
            singleAttributePerLine: false,
            htmlWhitespaceSensitivity: "css",
            vueIndentScriptAndStyle: false,
            proseWrap: "preserve",
            insertPragma: false,
            printWidth: 9999,
            requirePragma: false,
            tabWidth: 4,
            useTabs: true,
            embeddedLanguageFormatting: "off",
        }
    };

    window.Config = Config;
})(window);

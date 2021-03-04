module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "tsconfig.json",
      "test/tsconfig.json"
    ],
  },
  plugins: [
    "@typescript-eslint",
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": "warn",
    "@typescript-eslint/array-type": [
      "warn",
      {
        default: "array-simple",
        readonly: "generic"
      },
    ],
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/ban-types": [
      "warn",
      {
        "types": {
          "{}": false,
        },
        extendDefaults: true,
      }
    ],
    "@typescript-eslint/consistent-type-assertions": "off", // *
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/dot-notation": "warn",
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        accessibility: "no-public",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "comma",
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-explicit-any": "off", // we might want this on
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-implied-eval": "warn",
    "@typescript-eslint/no-inferrable-types": "off", // *
    "@typescript-eslint/no-misused-new": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-redeclare": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-shadow": [
      "warn",
      {
        ignoreTypeValueShadow: true,
      }
    ],
    "@typescript-eslint/no-this-alias": "warn",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off", // * was error
    "@typescript-eslint/no-unnecessary-type-arguments": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-member-access": "off", // Would be nice to be able to turn on
    "@typescript-eslint/no-unsafe-return": "off", // Would be nice to be able to turn on
    "@typescript-eslint/no-unused-expressions": [
      "warn",
      {
        "allowShortCircuit": true,
        "allowTernary": true,
        "allowTaggedTemplates": true
      }
    ],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/prefer-function-type": "warn",
    "@typescript-eslint/prefer-namespace-keyword": "warn",
    "@typescript-eslint/prefer-readonly": "warn",
    "@typescript-eslint/prefer-regexp-exec": "warn",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/restrict-plus-operands": "warn",
    "@typescript-eslint/semi": ["warn"],
    "@typescript-eslint/strict-boolean-expressions": "off", // *
    "@typescript-eslint/triple-slash-reference": [
      "warn",
      {
        path: "always",
        types: "prefer-import",
        lib: "always",
      },
    ],
    "@typescript-eslint/typedef": [
      "warn",
      {
        "parameter": true,
        "propertyDeclaration": true,
      }
    ],
    "@typescript-eslint/unbound-method": "off", // *
    "@typescript-eslint/unified-signatures": "warn",
    "arrow-parens": ["off", "always"],
    "camelcase": "warn",
    "comma-dangle": "off",
    "comma-spacing": "warn",
    "complexity": "off",
    "constructor-super": "warn",
    "eol-last": "off",
    "eqeqeq": ["warn", "smart"],
    "guard-for-in": "warn",
    "id-blacklist": [
      "warn",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined",
    ],
    "id-match": "warn",
    "import/order": "off",
    "max-classes-per-file": "off",
    "max-len": "off",
    "new-parens": "warn",
    "no-bitwise": "warn",
    "no-caller": "warn",
    "no-cond-assign": "warn",
    "no-console": "warn",
    "no-debugger": "warn",
    "no-duplicate-imports": "warn",
    "no-empty": "warn",
    "no-eval": "warn",
    "no-extra-bind": "warn",
    "no-extra-boolean-cast": "warn",
    "no-case-declarations": "warn",
    "no-constant-condition": "warn",
    "no-fallthrough": "off", // Handled by tsconfig option
    "no-invalid-this": "off", // * was warn
    "no-irregular-whitespace": "warn",
    "no-multiple-empty-lines": "off",
    "no-new-wrappers": "warn",
    "no-prototype-builtins": "warn",
    "no-redeclare": "off", // Handled by @typescript-eslint/no-redeclare
    "no-shadow": "off", // Handled by @typescript-eslint/no-shadow
    "no-throw-literal": "warn",
    "no-trailing-spaces": "warn",
    "no-undef-init": "warn",
    "no-underscore-dangle": "off", // * was warn
    "no-unexpected-multiline": "warn",
    "no-unused-expressions": "off", // Disabled because of @typescript-eslint/no-unused-expressions
    "no-unsafe-finally": "warn",
    "no-unsafe-optional-chaining": "warn",
    "no-unused-labels": "warn",
    "no-unused-vars": "off", // Disabled because of @typescript-eslint/no-unused-vars
    "no-useless-escape": "warn",
    "no-var": "warn",
    "no-void": ["warn", { "allowAsStatement": true }],
    "object-shorthand": "off",
    "one-var": ["off", "never"],
    "prefer-arrow/prefer-arrow-functions": "off",
    "prefer-const": "warn",
    "quotes": ["warn", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "quote-props": "off",
    "radix": "off",
    "sort-imports": "warn",
    "spaced-comment": ["warn", "always", { "exceptions": ["*-"], "markers": ["/"] }],
    "use-isnan": "warn",
    "valid-typeof": ["warn", { "requireStringLiterals": true }]
  }
};

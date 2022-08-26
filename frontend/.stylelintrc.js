module.exports = {
  plugins: [
    'stylelint-scss',
  ],
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  extends: [
    'stylelint-config-recess-order',
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recommended',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue/scss',
  ],
  rules: {
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          '/d/',
        ],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          '/^--var-/',
          'include',
          'mixin',
          'use',
          'if',
          'extend',
        ],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: [
          'v-deep',
          'deep',
        ],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'global',
          'deep',
        ],
      },
    ],
    'scss/dollar-variable-pattern': '^-',
  },
}

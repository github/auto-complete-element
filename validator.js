const SELECTOR = 'auto-complete'
const INPUT_RULE_ID = 'required-input-element-child'
// eslint-disable-next-line i18n-text/no-en
const INPUT_HELP_TEXT = 'This component requires an input field to be provided.'
const CLEAR_BUTTON_RULE_ID = 'optional-clear-must-be-button'
// eslint-disable-next-line i18n-text/no-en
const CLEAR_BUTTON_HELP_TEXT = 'If provided with clear button, it must be a button element.'

function checkForInput(autoCompleteElement) {
  return autoCompleteElement.querySelectorAll('input').length === 1
}

function checkForOptionalClearButton(autoCompleteElement) {
  const [input] = autoCompleteElement.querySelectorAll('input')
  if (!input) {
    return true
  }
  const clearButtonId = `${input.id || input.getAttribute('name')}-clear`
  const clearButton = autoCompleteElement.ownerDocument.getElementById(clearButtonId)
  if (!clearButton) {
    return true
  }
  if (clearButton instanceof HTMLButtonElement) {
    return true
  }
  return false
}

const rules = [
  {
    id: INPUT_RULE_ID,
    excludeHidden: true,
    selector: SELECTOR,
    metadata: {
      help: INPUT_HELP_TEXT,
      helpUrl: '',
    },
    all: [`${INPUT_RULE_ID}_0`],
  },
  {
    id: CLEAR_BUTTON_RULE_ID,
    excludeHidden: true,
    selector: SELECTOR,
    metadata: {
      help: CLEAR_BUTTON_HELP_TEXT,
      helpUrl: '',
    },
    all: [`${CLEAR_BUTTON_RULE_ID}_0`],
  },
]

const checks = [
  {
    id: `${INPUT_RULE_ID}_0`,
    evaluate: checkForInput,
    metadata: {impact: 'critical'},
  },
  {
    id: `${CLEAR_BUTTON_RULE_ID}_0`,
    evaluate: checkForOptionalClearButton,
    metadata: {impact: 'critical'},
  },
]

export function validator(domNode) {
  const result = {
    passes: [],
    violations: [],
  }
  for (const element of domNode.getElementsByTagName(SELECTOR)) {
    for (const rule of rules) {
      for (const checkId of rule.all) {
        const thisCheck = checks.find(check => check.id === checkId)
        const checkResult = thisCheck.evaluate(element)

        result[checkResult ? 'passes' : 'violations'].push({
          id: rule.id,
          help: rule.metadata.help,
          helpUrl: rule.metadata.helpUrl,
          nodes: [element],
        })
      }
    }
  }
  return result
}

/**
 *
 * @param {import('axe-core').Spec} ruleset
 * @returns {import('axe-core').Spec}
 */
export default function combineRules(ruleset = {}) {
  return Object.assign({}, ruleset, {
    checks: (ruleset.checks || []).concat(checks),
    rules: (ruleset.rules || []).concat(rules),
  })
}

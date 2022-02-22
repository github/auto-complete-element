const SELECTOR = 'auto-complete'
const INPUT_RULE_ID = 'required-input-element-child'
const INPUT_HELP_TEXT = 'This component requires an input field to be provided.'
const CLEAR_BUTTON_RULE_ID = 'optional-clear-must-be-button'
const CLEAR_BUTTON_HELP_TEXT = 'If provided with clear button, it must be a button element.'

/**
 * see https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
 *
 * must have input element
 *
 * if element provided with *-clear, must be button element
 *
 * 'label-title-only'
 *  must have 1 of:
 * - label
 * - aria-label
 * - aria-labelledby
 */

function checkForInput(autoCompleteElement) {
  return autoCompleteElement.getElementsByTagName('INPUT').length === 1
}

function checkForOptionalClearButton(autoCompleteElement) {
  const [input] = autoCompleteElement.getElementsByTagName('INPUT')
  if (!input) {
    return true
  }
  const clearButtonId = `${input.id || input.getAttribute('name')}-clear`
  const clearButton = autoCompleteElement.ownerDocument.getElementById(clearButtonId)
  if (clearButton && !(clearButton instanceof HTMLButtonElement)) {
    return false
  }
  return true
}

const generatedRules = [
  {
    id: INPUT_RULE_ID,
    excludeHidden: true,
    selector: SELECTOR,
    metadata: {
      help: INPUT_HELP_TEXT,
      helpUrl: ''
    },
    all: [`${INPUT_RULE_ID}_0`]
  },
  {
    id: CLEAR_BUTTON_RULE_ID,
    excludeHidden: true,
    selector: SELECTOR,
    metadata: {
      help: CLEAR_BUTTON_HELP_TEXT,
      helpUrl: ''
    },
    all: [`${CLEAR_BUTTON_RULE_ID}_0`]
  }
]

const generatedChecks = [
  {
    id: `${INPUT_RULE_ID}_0`,
    evaluate: checkForInput,
    metadata: {impact: 'critical'}
  },
  {
    id: `${CLEAR_BUTTON_RULE_ID}_0`,
    evaluate: checkForOptionalClearButton,
    metadata: {impact: 'critical'}
  }
]

export function validator(domNode) {
  const result = {
    passes: [],
    violations: []
  }
  for (const autoCompleteElement of domNode.getElementsByTagName(SELECTOR)) {
    for (const rule of generatedRules) {
      for (const checkId of rule.all) {
        const thisCheck = generatedChecks.find(check => check.id === checkId)
        const checkResult = thisCheck.evaluate(autoCompleteElement)

        result[checkResult ? 'passes' : 'violations'].push({
          id: rule.id,
          help: rule.metadata.help,
          helpUrl: rule.metadata.helpUrl,
          nodes: [autoCompleteElement]
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
    checks: (ruleset.checks || []).concat(generatedChecks),
    rules: (ruleset.rules || []).concat(generatedRules)
  })
}

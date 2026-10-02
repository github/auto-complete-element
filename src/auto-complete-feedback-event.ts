export type AutoCompleteFeedbackKey = 'results' | 'results-with-default' | 'option-selected' | 'results-hidden'

export class AutoCompleteFeedbackEvent extends Event {
  constructor(
    public readonly key: AutoCompleteFeedbackKey,
    public text: string,
    public readonly data: Record<string, unknown> = {},
  ) {
    super('auto-complete-feedback', {bubbles: true, cancelable: true})
  }
}

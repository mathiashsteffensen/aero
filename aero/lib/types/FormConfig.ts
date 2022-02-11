export interface FormConfig {
  formClass: string
  inputClass: string
  inputWrapperClass: string
  buttonClass: string
  errorFeedbackClass: string

  variants: {
    [name: string]: Partial<Omit<FormConfig, "variants">>
  }
}

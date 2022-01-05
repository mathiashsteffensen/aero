export interface ViewEngine {
  render(viewPath: string, data: unknown): string
}

export interface ViewEngine {
  load(viewDir: string): Promise<void>
  render(viewPath: string, data: unknown): Promise<string>
}

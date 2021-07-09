export class GHULError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GHULError'
  }
}

export interface PikchrRenderer {
  render(source: string): Promise<Uint8Array>;
}

export function createPikchrRenderer(): PikchrRenderer {
  return {
    async render(_source: string): Promise<Uint8Array> {
      throw new Error('Pikchr rendering not implemented yet.');
    }
  };
}

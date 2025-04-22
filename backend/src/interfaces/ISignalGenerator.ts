// interfaces/ISignalGenerator.ts
export interface ISignalGenerator {
  setFrequency(frequency: number): Promise<void>;
  setAmplitude(amplitude: number): Promise<void>;
  enableOutput(): Promise<void>;
  disableOutput(): Promise<void>;
}
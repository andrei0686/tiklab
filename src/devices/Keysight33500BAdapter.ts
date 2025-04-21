// devices/Keysight33500BAdapter.ts
import { ISignalGenerator } from "@/interfaces/ISignalGenerator";

export class Keysight33500BAdapter implements ISignalGenerator {
  constructor(private connection: any /* драйвер или API */) {}

  async setFrequency(frequency: number) {
    await this.connection.write(`FREQ ${frequency}Hz`);
  }

  async setAmplitude(amplitude: number) {
    await this.connection.write(`VOLT ${amplitude}V`);
  }

  async enableOutput() {
    await this.connection.write("OUTP ON");
  }

  async disableOutput() {
    await this.connection.write("OUTP OFF");
  }
}
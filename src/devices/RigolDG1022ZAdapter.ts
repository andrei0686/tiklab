// devices/RigolDG1022ZAdapter.ts
import { ISignalGenerator } from "@/interfaces/ISignalGenerator";

export class RigolDG1022ZAdapter implements ISignalGenerator {
  constructor(private connection: any) {}

  async setFrequency(frequency: number) {
    await this.connection.sendCommand(`SOUR1:FREQ ${frequency}`);
  }

  async setAmplitude(amplitude: number) {
    await this.connection.sendCommand(`SOUR1:VOLT ${amplitude}`);
  }

  async enableOutput() {
    await this.connection.sendCommand("OUTP1 ON");
  }

  async disableOutput() {
    await this.connection.sendCommand("OUTP1 OFF");
  }
}
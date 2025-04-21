// devices/DeviceFactory.ts
import { ISignalGenerator } from "@/interfaces/ISignalGenerator";
import { Keysight33500BAdapter } from "@/devices/Keysight33500BAdapter";
import { RigolDG1022ZAdapter } from "@/devices/RigolDG1022ZAdapter";

export class DeviceFactory {
  static createSignalGenerator(
    model: string,
    connection: any
  ): ISignalGenerator {
    switch (model) {
      case "Keysight33500B":
        return new Keysight33500BAdapter(connection);
      case "RigolDG1022Z":
        return new RigolDG1022ZAdapter(connection);
      default:
        throw new Error(`Unsupported device: ${model}`);
    }
  }
}
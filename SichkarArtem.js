class PowerStation {
  #maximumInput
  #batteryCapacity
  #maximumOutput
  #batteryPower
  #chargingBattery
  #device

  constructor(batteryCapacity, maximumInput, maximumOutput) {
    this.#batteryCapacity = batteryCapacity
    this.#maximumInput = maximumInput
    this.#maximumOutput = maximumOutput
    this.#device = new Map();
    this.#batteryPower = batteryCapacity
    this.#chargingBattery = 0
  }

  updateInput(voltage, current) {
    this.#chargingBattery = voltage * current
  }

  connectOutput(outputId) {
    this.#device.set(outputId, 0)
  }

  updateOutput(outputId, voltage, current) {
    this.#device.set(outputId, voltage * current)
  }

  disconnectOutput(outputId) {
    this.#device.delete(outputId)
  }

  updateBatteryLevel(capacityLeft) {
    this.#batteryPower = Math.max(0, Math.min(this.#batteryCapacity, capacityLeft));
  }

  get batteryPercentage() {
    return (this.#batteryPower / this.#batteryCapacity) * 100;
  }

  get totalOutputPower() {
    return Math.round(this.totalDevicePower)
  }

  get totalDevicePower() {
    return Array.from(this.#device.values()).reduce((acc, value) => acc + value, 0);
  }

  get timeRemaining() {
    if (this.status == "idle" || this.status == "overload") {
      return "99:59";
    }
    const power = Math.abs(this.#chargingBattery - this.totalDevicePower);
    const time = this.#batteryPower / power
    const hours = Math.floor(time);
    const minutes = Math.ceil((time - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  get status() {
    switch (true) {
      case this.#chargingBattery > this.#maximumInput || this.totalDevicePower > this.#maximumOutput || this.#batteryPower == 0 && this.totalOutputPower > 0:
        return "overload";
      case this.#chargingBattery == this.totalDevicePower && this.#chargingBattery == 0:
        return "idle";
      case this.#chargingBattery > this.totalDevicePower:
        return "charging";
      default:
        return "discharging";
    }
  }
}

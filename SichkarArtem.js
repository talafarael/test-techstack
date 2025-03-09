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
    if (this.status === "idle" || this.status === "overload") {
      return "99:59";
    }
    let time
    const power = Math.abs(this.#chargingBattery - this.totalDevicePower);
    if (power == 0) return "99:59";
    time = this.#batteryPower / power

    let hours = Math.floor(time);
    let minutes = Math.ceil((time - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  get status() {
    if (this.#chargingBattery > this.#maximumInput || this.totalOutputPower > this.#maximumOutput) {
      return "overload";
    }
    if (this.#chargingBattery === this.totalOutputPower && this.#chargingBattery === 0) {
      return "idle";
    }
    if (this.#chargingBattery > this.totalOutputPower) {
      return "charging";
    }
    if (this.#batteryPower === 0 && this.totalOutputPower > 0) {
      return "overload"; // Батарея разряжена, а нагрузка есть
    }
    return "discharging";
  }
}
function testPowerStation() {
  const station = new PowerStation(2000, 500, 800);

  // Проверяем начальное состояние
  console.assert(station.batteryPercentage === 100.0, "Ошибка: начальный заряд батареи должен быть 100%");
  console.assert(station.status === "idle", "Ошибка: начальный статус должен быть 'idle'");

  // Подключаем устройство и обновляем потребляемую мощность
  station.connectOutput("lamp_1");
  station.updateOutput("lamp_1", 12, 5); // 12V * 5A = 60W
  console.assert(station.totalOutputPower === 60, "Ошибка: потребляемая мощность должна быть 60W");
  console.assert(station.status === "discharging", "Ошибка: статус должен быть 'discharging'");

  // Подключаем еще одно устройство
  station.connectOutput("laptop");
  station.updateOutput("laptop", 20, 3); // 20V * 3A = 60W
  console.assert(station.totalOutputPower === 120, "Ошибка: потребляемая мощность должна быть 120W");

  // Проверяем расчет оставшегося времени
  station.updateBatteryLevel(1000); // Заряд 1000Wh
  console.assert(station.timeRemaining !== "99:59", "Ошибка: расчет оставшегося времени не должен быть 99:59");

  // Проверяем зарядку батареи
  station.updateInput(100, 5); // 100V * 5A = 500W (максимальный вход)
  console.assert(station.status === "charging", "Ошибка: статус должен быть 'charging'");

  // Проверяем отключение устройства
  station.disconnectOutput("lamp_1");
  console.assert(station.totalOutputPower === 60, "Ошибка: после отключения мощность должна быть 60W");

  console.log("✅ Все тесты пройдены!");
}

testPowerStation();


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
    let power = voltage * current

    this.#chargingBattery = power
  }

  connectOutput(outputId) {
    this.#device.set(outputId, 0)
  }

  updateOutput(outputId, voltage, current) {
    let power = voltage * current
    this.#device.set(outputId, power)
  }
  disconnectOutput(outputId) {
    this.#device.delete(outputId)
  }

  updateBatteryLevel(capacityLeft) {
    if (capacityLeft < 0) {
      capacityLeft = 0;
    } else if (capacityLeft >= this.#batteryCapacity) {
      capacityLeft = this.#batteryCapacity;
    }
    this.#batteryPower = capacityLeft
  }

  get batteryPercentage() {
    return (this.#batteryPower / this.#batteryCapacity) * 100;
  }

  get totalOutputPower() {
    let totalOutput = Array.from(this.#device.values()).reduce((acc, value) => acc + value, 0);
    return Math.round(totalOutput)
  }

  get timeRemaining() {
    let status = this.status
    if (status == "idle" || status == "overload") {
      return "99:59"
    }
    let deviceDischarging = Array.from(this.#device.values()).reduce((acc, value) => acc + value, 0);


    if (status == "discharging") {
      let batteryStatus = deviceDischarging - this.#chargingBattery
      let time = this.#batteryPower / batteryStatus
      let hours = Math.floor(time);
      let minutes = Math.ceil((time - hours) * 60);
      let formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      return formattedTime
    }
    if (status == "charging") {
      let remainingCapacity = this.#batteryCapacity - this.#batteryPower;
      let batteryStatus = this.#chargingBattery - deviceDischarging

      let time = batteryStatus / batteryStatus
      let hours = Math.floor(time);
      let minutes = Math.ceil((time - hours) * 60);
      let formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      return formattedTime
    }



  }

  get status() {
    let status
    let totalDevicePower = Array.from(this.#device.values()).reduce((acc, value) => acc + value, 0);


    let batteryStatus = totalDevicePower - this.#chargingBattery

    if (batteryStatus > 0) {
      status = "discharging"
    } else {
      status = "charging"
    }
    if (this.#chargingBattery == totalDevicePower) {
      status = "idle"
    }
    if (this.#chargingBattery > this.#maximumInput || totalDevicePower > this.#maximumOutput) {
      status = "overload";
    }
    return status
  }

}
const station = new PowerStation(2000, 500, 800);

console.log("=== Начальный статус ===");
console.log(station.batteryPercentage); // 100
console.log(station.totalOutputPower); // 0
console.log(station.timeRemaining); // 99:59
console.log(station.status); // idle

console.log("\n=== Подключаем устройства ===");
station.connectOutput("laptop");
station.updateOutput("laptop", 20, 14); // 280W
console.log(station.totalOutputPower); // 280
console.log(station.status); // discharging

console.log("\n=== Обновляем заряд батареи ===");
station.updateBatteryLevel(1500); // 75%
console.log(station.batteryPercentage); // 75
console.log(station.timeRemaining); // 05:21

console.log("\n=== Подключаем зарядку ===");
station.updateInput(220, 2); // 440W (заряжает)
console.log(station.status); // charging

console.log("\n=== Балансируем вход и выход ===");
station.updateInput(280, 1); // 280W (равен выходу)
console.log(station.status); // idle

console.log("\n=== Добавляем больше нагрузки ===");
station.connectOutput("heater");
station.updateOutput("heater", 220, 2); // +440W (итого 720W)
console.log(station.totalOutputPower); // 720
console.log(station.status); // discharging

console.log("\n=== Перегрузка выхода ===");
station.updateOutput("heater", 220, 3.5); // 770W + 280W = 1050W (> 800W)
console.log(station.status); // overload

console.log("\n=== Убираем перегрузку ===");
station.updateOutput("heater", 220, 1.5); // 330W + 280W = 610W (норм)
console.log(station.status); // discharging

console.log("\n=== Полностью разряжаем батарею ===");
station.updateBatteryLevel(0); // 0%
console.log(station.batteryPercentage); // 0
console.log(station.status); // discharging

console.log("\n=== Полностью заряжаем батарею ===");
station.updateBatteryLevel(2000); // 100%
station.updateInput(720, 1); // Вход = выход (зарядка покрывает потребление)
console.log(station.batteryPercentage); // 100
console.log(station.status); // idle

console.log("\n=== Перегрузка входа ===");
station.updateInput(600, 2); // 1200W (> 500W)
console.log(station.status); 

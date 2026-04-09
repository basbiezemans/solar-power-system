<template>
  <form class="solar-app">
    <h1>Solar Power System</h1>
    <div class="flex-container">
      <div class="flex-child">
        <fieldset>
          <legend>System Diagram</legend>
          <img src="/img/solar-power-system-diagram.png" width="100%">
        </fieldset>
      </div>
      <div class="flex-child">
        <SystemRequirements 
          :devices="state.devices"
          :total-watt-hours="totalWattHours"
          :backup-days="state.backupDays"
          @device-added="handleDeviceAdded"
          @device-removed="handleDeviceRemoved"
          @update:backup-days="(v) => { state.backupDays = v; recalculate() }"
        />
      </div>
      <div class="flex-child">
        <SolarPanel :capacity="state.batteryCapacity" />
        <BatteryConfig 
          :type="state.batteryType"
          :voltage="state.voltage"
          :battery-capacity="state.batteryCapacity"
          :watt-hours="totalWattHours"
          :backup-days="state.backupDays"
          @update:type="(v) => handleBatteryTypeChange(v)"
          @update:voltage="(v) => handleVoltageChange(v)"
          @capacity-changed="recalculate"
        />
        <ChargeController :amperage="state.controllerAmperage" />
        <BatteryCableSection 
          :amperage="state.controllerAmperage"
          :fuse-size="state.fuseSizeAmperage"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { SolarPowerSystem } from './system'
import { BatteryCable } from './cable'
import SystemRequirements from './components/SystemRequirements.vue'
import SolarPanel from './components/SolarPanel.vue'
import BatteryConfig from './components/BatteryConfig.vue'
import ChargeController from './components/ChargeController.vue'
import BatteryCableSection from './components/BatteryCableSection.vue'

const solarSystem = new SolarPowerSystem()

interface Device {
  descr: string
  watts: number
  hours: number
}

interface AppState {
  devices: Device[]
  backupDays: number
  batteryType: string
  voltage: string
  batteryCapacity: number
  controllerAmperage: number
  fuseSizeAmperage: number
}

const state = reactive<AppState>({
  devices: [],
  backupDays: 1,
  batteryType: 'lithium',
  voltage: '12',
  batteryCapacity: 0,
  controllerAmperage: 0,
  fuseSizeAmperage: 0,
})

const totalWattHours = computed(() => {
  return state.devices.reduce((sum, device) => sum + device.watts * device.hours, 0)
})

const handleDeviceAdded = (device: Device) => {
  state.devices.push(device)
  recalculate()
}

const handleDeviceRemoved = (index: number) => {
  state.devices.splice(index, 1)
  recalculate()
}

const handleBatteryTypeChange = (type: string) => {
  state.batteryType = type
  recalculate()
}

const handleVoltageChange = (voltage: string) => {
  state.voltage = voltage
  recalculate()
}

const recalculate = () => {
  if (totalWattHours.value === 0) {
    state.batteryCapacity = 0
    state.controllerAmperage = 0
    state.fuseSizeAmperage = 0
    return
  }

  // Calculate battery capacity
  state.batteryCapacity = solarSystem.getBatteryCapacity(
    state.batteryType,
    totalWattHours.value,
    state.backupDays
  )

  // Calculate controller amperage
  state.controllerAmperage = solarSystem.getSolarControllerAmperage(
    state.batteryCapacity,
    state.voltage
  )

  // Calculate fuse size
  state.fuseSizeAmperage = solarSystem.getFuseSizeAmperage(state.controllerAmperage)
}
</script>

<style scoped>
.solar-app {
  font-family: Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.flex-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.flex-child {
  flex: 1;
  min-width: 300px;
}

h1 {
  text-align: center;
  color: #333;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

legend {
  padding: 0 10px;
  font-weight: bold;
  color: #333;
}
</style>

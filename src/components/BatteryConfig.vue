<template>
  <div class="battery-config">
    <fieldset>
      <legend>Battery</legend>

      <div class="form-group">
        <select v-model="batteryType" @change="onTypeChange">
          <option value="lithium">Lithium Ion</option>
          <option value="leadacid">Lead Acid</option>
        </select>
        <label>Type</label>
      </div>

      <div class="form-group">
        <select v-model="voltage" @change="onVoltageChange">
          <option value="12">12V</option>
          <option value="24">24V</option>
          <option value="48">48V</option>
        </select>
        <label>Voltage</label>
      </div>

      <div class="capacity-section">
        <div class="section-label">Minimum Capacity</div>
        <div class="form-group">
          <input
            type="text"
            :value="ampHours"
            readonly
            id="minimum-capacity"
            class="readonly-input"
          >
          <label>Amp hours</label>
        </div>

        <div class="section-label">Fuse Size</div>
        <div class="form-group">
          <input
            type="text"
            :value="fuseSizeAmperage"
            readonly
            id="fuse-size-amperage"
            class="readonly-input"
          >
          <label>Amp</label>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SolarPowerSystem } from '../system'

const solarSystem = new SolarPowerSystem()

const props = defineProps<{
  type: string
  voltage: string
  batteryCapacity: number
  wattHours: number
  backupDays: number
}>()

const emit = defineEmits<{
  'update:type': [value: string]
  'update:voltage': [value: string]
  'capacity-changed': []
}>()

const batteryType = computed({
  get: () => props.type,
  set: (value) => emit('update:type', value),
})

const voltage = computed({
  get: () => props.voltage,
  set: (value) => emit('update:voltage', value),
})

const ampHours = computed(() => {
  return solarSystem.getCapacityInAmpHours(props.batteryCapacity, props.voltage)
})

const fuseSizeAmperage = computed(() => {
  return solarSystem.getFuseSizeAmperage(
    solarSystem.getSolarControllerAmperage(props.batteryCapacity, props.voltage)
  )
})

const onTypeChange = () => {
  emit('capacity-changed')
}

const onVoltageChange = () => {
  emit('capacity-changed')
}
</script>

<style scoped>
.battery-config fieldset {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin: 15px 0;
}

.form-group select,
.form-group input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.readonly-input {
  background-color: #f0f0f0;
  cursor: default;
  width: 100%;
  box-sizing: border-box;
}

.form-group label {
  font-size: 12px;
  color: #666;
}

.section-label {
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 10px;
  color: #333;
}

.capacity-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}
</style>

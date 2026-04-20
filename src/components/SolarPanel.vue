<template>
  <div class="solar-panel">
    <fieldset>
      <legend>Solar Panel</legend>
      <div class="form-group">
        <input
          v-model.number="avgSunHours"
          type="number"
          min="1"
          max="24"
          @change="validateSunHours"
          id="avg-sun-hours"
          class="number-input"
        >
        <label>Avg. sun hours per day</label>
      </div>

      <div class="form-group">
        <input
          type="text"
          :value="solarArrayWattage"
          readonly
          id="array-wattage"
          class="readonly-input"
        >
        <label>Watt (minimum)</label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SolarPowerSystem } from '../system'

const solarSystem = new SolarPowerSystem()

const props = defineProps<{
  capacity: number
}>()

const emit = defineEmits<{
  'update:capacity': [value: number]
}>()

const avgSunHours = ref(7)

const validateSunHours = () => {
  if (avgSunHours.value < 1) avgSunHours.value = 1
  if (avgSunHours.value > 24) avgSunHours.value = 24
}

const solarArrayWattage = computed(() => {
  if (props.capacity === 0) return 0
  return solarSystem.getSolarArrayWattage(props.capacity, avgSunHours.value)
})
</script>

<style scoped>
.solar-panel fieldset {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin: 15px 0;
}

.form-group input {
  display: block;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.number-input {
  width: 100%;
  box-sizing: border-box;
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
</style>

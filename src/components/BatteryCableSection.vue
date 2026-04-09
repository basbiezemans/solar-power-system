<template>
  <div class="battery-cable">
    <fieldset>
      <legend>Battery Cable</legend>

      <div class="form-group">
        <select v-model="cableLength" @change="updateWireGauge" class="cable-select">
          <option value="">Select cable length...</option>
          <option v-for="length in lengthOptions" :key="length" :value="length">
            {{ length }} ft ({{ (length / 3.281).toFixed(1) }} m)
          </option>
        </select>
        <label for="cablelen">Length</label>
      </div>

      <div class="form-group">
        <input 
          type="text"
          :value="wireGauge"
          readonly
          class="readonly-input"
        >
        <label for="wiregauge">Gauge / AWG</label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BatteryCable } from '../cable'

const batteryCable = new BatteryCable()

const props = defineProps<{
  amperage: number
  fuseSize: number
}>()

const cableLength = ref('6')
const wireGauge = ref('')

const lengthOptions = computed(() => batteryCable.getLengthOptions() as number[])

const currentOptions = computed(() => batteryCable.getCurrentOptions() as number[])

const updateWireGauge = () => {
  if (!cableLength.value || props.amperage === 0) {
    wireGauge.value = ''
    return
  }

  const options = currentOptions.value
  const current = options.find(e => e >= props.amperage) as number
  
  if (current) {
    wireGauge.value = batteryCable.getWireGauge(parseInt(cableLength.value), current)
  } else {
    wireGauge.value = 'Not available'
  }
}

// Watch for changes in amperage prop to update wire gauge
watch(() => props.amperage, () => {
  updateWireGauge()
})
</script>

<style scoped>
.battery-cable fieldset {
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
}

.cable-select {
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
</style>

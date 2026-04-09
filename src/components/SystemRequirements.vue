<template>
  <div class="system-requirements">
    <fieldset>
      <legend>System Requirements</legend>
      
      <button type="button" @click="showModal = true" class="btn-primary">
        Add device
      </button>

      <div class="device-list">
        <div v-if="devices.length === 0" class="empty-state">
          No devices added yet
        </div>
        <div v-for="(device, index) in devices" :key="index" class="device-item">
          <input 
            type="text" 
            :value="`${device.watts * device.hours}`" 
            readonly
            class="device-watt-hours"
          >
          <label>{{ device.descr }}</label>
          <button type="button" @click="removeDevice(index)" class="btn-remove">×</button>
        </div>
      </div>

      <div class="total-watt-hours">
        <input 
          type="text" 
          :value="totalWattHours" 
          readonly
          id="watt-hours"
          class="readonly-input"
        >
        <label for="watt-hours">Total Watt hours</label>
      </div>

      <div class="form-group">
        <input 
          v-model.number="backupDays"
          type="number" 
          min="1" 
          max="365"
          @change="validateBackup"
          id="backup-days"
          class="number-input"
        >
        <label for="backup-days">Autonomy (Day(s))</label>
      </div>
    </fieldset>

    <!-- Modal Dialog -->
    <dialog v-if="showModal" class="device-modal" open>
      <div class="modal-content">
        <fieldset>
          <legend>Add Device</legend>
          
          <div class="form-group">
            <input 
              v-model="newDevice.descr"
              type="text" 
              placeholder="Generic Device"
              class="text-input"
            >
            <label>Name or type (optional)</label>
          </div>

          <div class="form-group">
            <input 
              v-model.number="newDevice.watts"
              type="number"
              min="0"
              max="10000"
              class="number-input"
              @change="validateWatts"
            >
            <label>Watts</label>
          </div>

          <div class="form-group">
            <input 
              v-model.number="newDevice.hours"
              type="number"
              min="0"
              max="24"
              class="number-input"
              @change="validateHours"
            >
            <label>Hours per day</label>
          </div>

          <div class="modal-buttons">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="button" @click="addDevice" class="btn-primary">
              Add
            </button>
          </div>
        </fieldset>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Device {
  descr: string
  watts: number
  hours: number
}

const props = defineProps<{
  devices: Device[]
  totalWattHours: number
  backupDays: number
}>()

const emit = defineEmits<{
  'device-added': [device: Device]
  'device-removed': [index: number]
  'update:backupDays': [value: number]
}>()

const showModal = ref(false)
const newDevice = ref({
  descr: '',
  watts: 0,
  hours: 0,
})

const backupDays = computed({
  get: () => props.backupDays,
  set: (value) => emit('update:backupDays', value),
})

const addDevice = () => {
  if (newDevice.value.watts === 0) {
    alert('"Watts" should be greater than zero')
    return
  }
  if (newDevice.value.hours === 0) {
    alert('"Hours per day" should be greater than zero')
    return
  }

  const device = {
    descr: newDevice.value.descr || 'Generic Device',
    watts: newDevice.value.watts,
    hours: newDevice.value.hours,
  }

  emit('device-added', device)
  closeModal()
}

const removeDevice = (index: number) => {
  emit('device-removed', index)
}

const closeModal = () => {
  showModal.value = false
  newDevice.value = { descr: '', watts: 0, hours: 0 }
}

const validateWatts = () => {
  if (newDevice.value.watts < 1) newDevice.value.watts = 1
  if (newDevice.value.watts > 10000) newDevice.value.watts = 10000
}

const validateHours = () => {
  if (newDevice.value.hours < 0) newDevice.value.hours = 0
  if (newDevice.value.hours > 24) newDevice.value.hours = 24
}

const validateBackup = () => {
  if (backupDays.value < 1) backupDays.value = 1
  if (backupDays.value > 365) backupDays.value = 365
}
</script>

<style scoped>
.system-requirements fieldset {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
}

.btn-remove {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
  margin-left: 10px;
}

.device-list {
  margin: 15px 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.device-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  gap: 10px;
}

.device-watt-hours {
  width: 80px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.empty-state {
  color: #999;
  font-style: italic;
  padding: 10px;
}

.total-watt-hours {
  margin: 15px 0;
}

.total-watt-hours input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.backup-config {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-content fieldset {
  border: none;
  padding: 0;
}

.form-group {
  margin: 15px 0;
}

.form-group input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group label {
  font-size: 12px;
  color: #666;
}

.readonly-input {
  background-color: #f0f0f0;
  cursor: default;
  width: 100%;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.text-input {
  padding: 8px !important;
}
</style>

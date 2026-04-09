<template>
  <div class="charge-controller">
    <fieldset>
      <legend>Battery Charge Controller</legend>
      <div class="form-group">
        <input 
          type="text"
          :value="amperage"
          readonly
          class="readonly-input"
        >
        <label for="amperage">Amp (minimum)</label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  amperage: number
}>()
</script>

<style scoped>
.charge-controller fieldset {
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
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

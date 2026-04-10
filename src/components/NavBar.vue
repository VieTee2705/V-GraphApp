<template>
  <nav class="mini-navbar d-flex align-items-center px-2">
    <button class="btn-run me-3" @click="$emit('run-algorithm')" :disabled="!start || !end">
      <i class="fas fa-play me-1"></i> RUN
    </button>

    <button class="btn-clear me-2" @click="$emit('delete-all')" title="Xóa toàn bộ đồ thị">
      <i class="fas fa-trash-alt me-1"></i> CLEAR ALL
    </button>

    <button class="btn-lock me-auto" @click="$emit('fix-nodes')" title="Cố định vị trí tất cả nodes">
      <i class="fas fa-lock me-1"></i> FIX ALL
    </button>

    <div class="form-check form-switch ms-3 me-3 mb-0 d-flex align-items-center">
      <input 
        class="form-check-input mt-0 me-2" 
        type="checkbox" 
        id="directedSwitch" 
        :checked="isDirected"
        @change="$emit('update:isDirected', $event.target.checked)"
        style="cursor: pointer;"
      >
      <label class="form-check-label mode-label" for="directedSwitch">
        {{ isDirected ? 'CÓ HƯỚNG' : 'VÔ HƯỚNG' }}
      </label>
    </div>

    <div class="export-group ms-2 me-auto d-flex align-items-center gap-1">
      <select v-model="exportFormat" class="export-select" title="Chọn định dạng">
        <option value="svg">SVG</option>
        <option value="png">PNG</option>
        <option value="jpeg">JPG</option>
      </select>
      <button class="btn-export" @click="$emit('export-graph', exportFormat)" title="Xuất đồ thị">
        <i class="fas fa-download me-1"></i> EXPORT
      </button>
    </div>

    <div class="counter-control d-flex align-items-center">
      <button class="btn-step" @click="decrease">
        <i class="fas fa-minus"></i>
      </button>
      <span class="value-text mx-2">{{ value }}</span>
      <button class="btn-step" @click="increase">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  start: String,
  end: String,
  isDirected: Boolean // <-- Thêm prop nhận state
})

defineEmits(['run-algorithm', 'delete-all', 'export-graph', 'update:isDirected', 'fix-nodes'])

const value = ref(1)
const exportFormat = ref('svg')

const increase = () => value.value++
const decrease = () => {
  if (value.value > 1) value.value--
}
</script>
<style scoped>
/* Định nghĩa biến màu theo yêu cầu của bạn */
:root {
  --bg-color: #FFFFFF;
  --text-main: #1A1A1B;
  --primary-color: #0056B3;
  --accent-color: #E1EFFF;
  --border-color: #dee2e6;
}

.mini-navbar {
  height: 30px; /* Chiều cao cố định theo yêu cầu */
  flex-shrink: 0;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  font-family: sans-serif;
  box-sizing: border-box;
}

.btn-run {
  background: var(--primary-color);
  color: white;
  border: none;
  font-size: 9px; /* Cực nhỏ để khớp 15px */
  font-weight: bold;
  height: 28px;
  line-height: 1;
  padding: 0 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.btn-run:hover {
  filter: brightness(1.2);
}

.btn-clear {
  background: #dc3545;
  color: white;
  border: none;
  font-size: 9px;
  font-weight: bold;
  height: 28px;
  line-height: 1;
  padding: 0 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-clear:hover {
  background: #c82333;
}

.btn-lock {
  background: #6c757d;
  color: white;
  border: none;
  font-size: 9px;
  font-weight: bold;
  height: 28px;
  line-height: 1;
  padding: 0 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-lock:hover {
  background: #5a6268;
}

.btn-export {
  background: #28a745;
  color: white;
  border: none;
  font-size: 9px;
  font-weight: bold;
  height: 28px;
  line-height: 1;
  padding: 0 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-export:hover {
  background: #218838;
}

.counter-control {
  height: 100%;
}

.btn-step {
  background: var(--accent-color);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  width: 20px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8px;
  padding: 0;
  cursor: pointer;
  border-radius: 2px;
}

.btn-step:hover {
  background-color: #d1e5ff;
}

.value-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-main);
  min-width: 10px;
  text-align: center;
}

/* Tinh chỉnh Font Awesome icon */
.fas {
  font-size: 13px;
}
.mode-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  user-select: none;
  min-width: 65px;
}

/* Style cho Select box */
.export-select {
  height: 28px;
  font-size: 10px;
  font-weight: 600;
  padding: 0 20px 0 8px;
  border-radius: 2px;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  background-color: var(--bg-color);
  cursor: pointer;
  outline: none;
}

.export-select:focus {
  border-color: var(--primary-color);
}

.btn-export {
  background: #28a745;
  color: white;
  border: none;
  font-size: 9px;
  font-weight: bold;
  height: 28px;
  line-height: 1;
  padding: 0 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-export:hover {
  background: #218838;
}
</style>
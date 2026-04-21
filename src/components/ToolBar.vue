<template>
  <nav class="mini-navbar d-flex align-items-center px-2">
    <button class="btn-run me-3" @click="$emit('run-algorithm')" :disabled="!start || !end">
      <i class="fas fa-play me-1"></i> RUN
    </button>

    <button class="btn-clear me-auto" @click="$emit('delete-all')" title="Xóa toàn bộ đồ thị">
      <i class="fas fa-trash-alt me-1"></i> CLEAR ALL
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

    <div class="form-check form-switch ms-3 me-3 mb-0 d-flex align-items-center">
      <input 
        class="form-check-input mt-0 me-2" 
        type="checkbox" 
        id="fixedSwitch" 
        :checked="isFixed"
        @change="$emit('update:isFixed', $event.target.checked)"
        style="cursor: pointer;"
      >
      <label class="form-check-label mode-label" for="fixedSwitch">
        {{ isFixed ? 'CỐ ĐỊNH' : 'TRÔI TỰ DO' }}
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
      <label class="value-text me-2 mb-0">Speed:</label>
      <button class="btn-step" @click="decrease">
        <i class="fas fa-minus"></i>
      </button>
      <span class="value-text mx-2">{{ speed }}ms</span>
      <button class="btn-step" @click="increase">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  start: String,
  end: String,
  isDirected: Boolean,
  isFixed: Boolean,
  speed: Number // Khai báo prop speed
})

const emit = defineEmits(['run-algorithm', 'delete-all', 'export-graph', 'update:isDirected', 'update:isFixed', 'fix-nodes', 'update:speed'])

const exportFormat = ref('svg')

// Phát sự kiện update:speed thay vì đổi biến nội bộ
const increase = () => emit('update:speed', props.speed + 100)
const decrease = () => {
  if (props.speed > 100) emit('update:speed', props.speed - 100)
}
</script>

<style scoped>
:root {
  --bg-color: #FFFFFF;
  --text-main: #1A1A1B;
  --primary-color: #0056B3;
  --accent-color: #E1EFFF;
  --border-color: #dee2e6;
}

/* 1. Thanh Toolbar chính */
.mini-navbar {
  min-height: 44px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  padding: 0 16px;
}

/* 2. Style chung cho các nút bấm */
.btn-run, .btn-clear, .btn-export {
  border: none;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.btn-run i, .btn-clear i, .btn-export i {
  font-size: 12px;
  margin-right: 6px;
}

.btn-run {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 86, 179, 0.25);
}

.btn-run:hover:not(:disabled) {
  background-color: #004494;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 86, 179, 0.35);
}

.btn-run:disabled {
  background-color: #a0c4e8;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.8;
}

.btn-clear {
  background-color: transparent;
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.4);
}

.btn-clear:hover {
  background-color: #dc3545;
  color: #ffffff;
}

/* 3. Khu vực Switches */
.form-check-input {
  cursor: pointer;
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem var(--accent-color);
}

.mode-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.3px;
  min-width: 70px;
}

/* 4. Nhóm Export */
.export-group {
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 2px 2px 2px 8px;
}

.export-select {
  border: none;
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  padding: 4px 8px 4px 0;
  outline: none;
  cursor: pointer;
}

.btn-export {
  background-color: #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 4px;
}

.btn-export:hover {
  background-color: #cbd5e1;
  color: #0f172a;
}

/* 5. Khối Counter Control */
.counter-control {
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 2px;
}

.btn-step {
  background: var(--bg-color);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
}

.btn-step:hover {
  background: var(--accent-color);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.value-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-main);
  min-width: 16px;
  text-align: center;
}
</style>
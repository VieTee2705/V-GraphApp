<template>
  <nav class="mini-navbar d-flex align-items-center px-2">
    <button class="btn-run me-3"  @click="$emit('run-algorithm')" :disabled="!start || !end">
      <i class="fas fa-play me-1"></i> RUN
    </button>

    <!-- Nút xóa toàn bộ đồ thị -->
    <button class="btn-clear me-auto" @click="$emit('delete-all')" title="Xóa toàn bộ đồ thị">
      <i class="fas fa-trash-alt me-1"></i> CLEAR ALL
    </button>

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
  end: String
})

// Khai báo thêm sự kiện delete-all
defineEmits(['run-algorithm', 'delete-all'])

// Initial state value = 1
const value = ref(1)

const increase = () => value.value++
const decrease = () => {
  if (value.value > 1) value.value-- // Giới hạn tối thiểu là 1
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
</style>
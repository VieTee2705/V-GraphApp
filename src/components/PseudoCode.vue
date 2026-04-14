<template>
  <div class="pseudo-code-card shadow-sm">
    <div class="code-header d-flex align-items-center bg-dark text-white p-2 rounded-top">
      <i class="fas fa-laptop-code me-2"></i>
      <span class="fw-bold fs-6">Mô phỏng Mã giả Dijkstra</span>
    </div>
    
    <div class="code-body bg-light p-3 rounded-bottom" style="font-family: 'Fira Code', 'Courier New', monospace; font-size: 13px; overflow-x: auto;">
      <!-- Khởi tạo -->
      <div class="code-line" :class="{ 'active-line': step === 'INIT' }">
        <span class="keyword">void</span> <span class="function">Dijkstra</span>(Graph *pG, <span class="keyword">int</span> s) {
      </div>
      <div class="code-line comment indent-1" :class="{ 'active-line': step === 'INIT' }">
        // Khởi tạo mark[x] = 0, pi[x] = &infin; với mọi x
      </div>
      <div class="code-line indent-1" :class="{ 'active-line': step === 'INIT' }">
        pi[s] = <span class="number">0</span>;
      </div>

      <div class="code-line mt-2">
        <span class="keyword">Lặp</span> n - 1 <span class="keyword">lần</span>: {
      </div>
      
      <!-- Tìm đỉnh u -->
      <div class="code-line comment indent-2" :class="{ 'active-line': step === 'CURRENT_NODE' }">
        // 1. Tìm u chưa chắc chắn có pi[u] nhỏ nhất<br>
        // 2. Đánh dấu u là đỉnh chắc chắn: mark[u] = 1;
      </div>
      
      <!-- GIÁ TRỊ ĐỘNG CỦA U -->
      <div v-if="u" class="dynamic-val indent-2 text-primary fw-bold mb-2">
        &rarr; Hiện tại: <span class="badge bg-primary">u = {{ u }}</span>, pi[{{ u }}] = {{ formatInf(piU) }}
      </div>

      <!-- Xét kề v -->
      <div class="code-line indent-2" :class="{ 'active-line': step === 'CHECKING_NEIGHBOR' || step === 'UPDATED_DISTANCE' }">
        <span class="keyword">for</span> (các đỉnh kề v chưa chắc chắn của u) {
      </div>

      <!-- GIÁ TRỊ ĐỘNG CỦA V -->
      <div v-if="v && (step === 'CHECKING_NEIGHBOR' || step === 'UPDATED_DISTANCE')" class="dynamic-val indent-3 text-success fw-bold">
        &rarr; Đang xét: <span class="badge bg-success">v = {{ v }}</span>, trọng số W({{u}}, {{v}}) = {{ w }}
      </div>

      <!-- Điều kiện cập nhật -->
      <div class="code-line indent-3" :class="{ 'active-line': step === 'CHECKING_NEIGHBOR' }">
        <span class="keyword">if</span> (pi[{{ u || 'u' }}] + trọng_số({{ u || 'u' }}, {{ v || 'v' }}) &lt; pi[{{ v || 'v' }}]) {
      </div>
      
      <!-- ĐÁNH GIÁ ĐIỀU KIỆN ĐỘNG -->
      <div v-if="v && step === 'CHECKING_NEIGHBOR'" class="dynamic-val indent-4 fw-bold" :class="(piU + w) < piV ? 'text-danger' : 'text-secondary'">
        // Tức là: {{ formatInf(piU) }} + {{ w }} &lt; {{ formatInf(piV) }} 
        &rarr; <span class="badge" :class="(piU + w) < piV ? 'bg-danger' : 'bg-secondary'">{{ (piU + w) < piV ? 'ĐÚNG' : 'SAI' }}</span>
      </div>

      <!-- Cập nhật đường đi -->
      <div class="code-line indent-4" :class="{ 'active-line': step === 'UPDATED_DISTANCE' }">
        pi[{{ v || 'v' }}] = pi[{{ u || 'u' }}] + trọng_số({{ u || 'u' }}, {{ v || 'v' }});
      </div>
      <div class="code-line indent-4" :class="{ 'active-line': step === 'UPDATED_DISTANCE' }">
        p[{{ v || 'v' }}] = {{ u || 'u' }};
      </div>
      
      <div class="code-line indent-3">}</div>
      <div class="code-line indent-2">}</div>
      <div class="code-line indent-1">}</div>
      <div class="code-line">}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  step: { type: String, default: 'idle' }, // INIT, CURRENT_NODE, CHECKING_NEIGHBOR, UPDATED_DISTANCE, VISITED, DONE
  u: { type: String, default: '' },
  v: { type: String, default: '' },
  w: { type: Number, default: 0 },
  piU: { type: Number, default: Infinity },
  piV: { type: Number, default: Infinity }
});

const formatInf = (val) => {
  return val === Infinity ? '∞' : val;
};
</script>

<style scoped>
.pseudo-code-card {
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 8px;
  background-color: #fff;
}

.code-line {
  line-height: 1.6;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  color: #24292e;
}

.code-line.active-line {
  background-color: #fff3cd; /* Màu vàng nhạt highlight */
  border-left: 4px solid #ffc107;
  font-weight: bold;
}

.keyword { color: #d73a49; font-weight: bold; }
.function { color: #6f42c1; font-weight: bold; }
.number { color: #005cc5; }
.comment { color: #6a737d; font-style: italic; }

.indent-1 { margin-left: 1.5rem; }
.indent-2 { margin-left: 3rem; }
.indent-3 { margin-left: 4.5rem; }
.indent-4 { margin-left: 6rem; }

.dynamic-val {
  font-family: 'Inter', sans-serif; /* Dùng font thường cho dễ đọc kết quả */
  font-size: 12.5px;
  margin-top: 4px;
  margin-bottom: 4px;
}
</style>
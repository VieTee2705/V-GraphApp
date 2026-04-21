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
/* 1. Container chính của thẻ Code */
.pseudo-code-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-color);
  
 /* Thiết lập chiều cao cố định để không bị nhảy */ 
  height: 100%; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
/* 2. Header của thẻ Code */
.code-header {
  background-color: var(--accent-color) !important; /* Ghi đè bg-dark của Bootstrap */
  color: var(--primary-color) !important;           /* Ghi đè text-white */
  border-bottom: 1px solid var(--border-color);
  padding: 1rem !important; /* Đồng bộ padding với card-header-component */
  border-radius: 12px 12px 0 0 !important;
}

/* 3. Phần thân chứa Code */
.code-body {
  background-color: #FAFAFB !important; /* Màu nền xám cực nhạt để tách biệt vùng code */
  color: var(--text-main);
  padding: 1.25rem !important;
  border-radius: 0 0 12px 12px !important;
}

/* Tùy chỉnh thanh cuộn ngang (nếu code quá dài) */
.code-body::-webkit-scrollbar {
  height: 6px;
}
.code-body::-webkit-scrollbar-track {
  background: transparent;
}
.code-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

/* 4. Dòng code & Trạng thái Active (Highlight) */
.code-line {
  line-height: 1.7;
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 4px solid transparent; /* Giữ khoảng trống để khi active không bị giật layout */
  transition: all 0.3s ease;
  color: var(--text-main);
}

.code-line.active-line {
  background-color: var(--accent-color); /* Dùng màu xanh nhạt của theme */
  border-left: 4px solid var(--primary-color); /* Viền trái màu xanh đậm của theme */
  color: var(--primary-color);
}

/* 5. Syntax Highlighting (Màu sắc từ khóa) */
.keyword { color: var(--primary-color); font-weight: 700; } 
.function { color: #d63384; font-weight: 700; } /* Màu hồng/tím để nổi bật tên hàm */
.number { color: #009688; font-weight: 600; } /* Màu xanh ngọc cho số */
.comment { color: #6c757d; font-style: italic; font-weight: normal; }

/* 6. Thụt lề (Indentation) */
.indent-1 { margin-left: 1.5rem; }
.indent-2 { margin-left: 3rem; }
.indent-3 { margin-left: 4.5rem; }
.indent-4 { margin-left: 6rem; }

/* 7. Giá trị động (Dynamic Values) */
.dynamic-val {
  font-family: 'Inter', system-ui, -apple-system, sans-serif; /* Quay về font thường cho dễ đọc */
  font-size: 13px;
  margin-top: 6px;
  margin-bottom: 6px;
  padding: 4px 8px;
  background-color: var(--bg-color);
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}

/* Tùy chỉnh nhẹ lại badge của Bootstrap cho hợp theme */
.badge {
  font-family: 'Fira Code', 'Courier New', monospace; /* Số trong badge giữ font code */
  font-weight: 600;
  padding: 0.35em 0.6em;
  border-radius: 4px;
}
</style>
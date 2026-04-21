<template>
  <div class="card-component">
      <div class="card-header-component"><i class="fas fa-poll-h me-2"></i>Kết Quả Dijkstra</div>
      <div class="card-body">
          <div v-if="path && path.length > 0">
              <div class="text-center mb-4">
                  <div class="small text-muted mb-2">Lộ trình ngắn nhất</div>
                  <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
                      <template v-for="(node, idx) in path" :key="idx">
                          <span class="path-badge">{{node}}</span>
                          <i v-if="idx < path.length - 1" class="fas fa-chevron-right text-muted small"></i>
                      </template>
                  </div>
              </div>

              <div class="p-3 border rounded" style="background-color: var(--accent-color);">
                  <div class="d-flex justify-content-between mb-2">
                      <span class="fw-bold" style="color: var(--primary-color)">Tổng khoảng cách:</span>
                      <span class="fw-bold text-primary fs-5">{{distance}}</span>
                  </div>
              </div>
          </div>

          <div v-else class="text-center py-5">
              <i class="fas fa-route fa-3x mb-3" style="color: #dee2e6"></i>
              <p class="text-muted">Chưa tìm thấy đường đi.<br>Hãy đảm bảo 2 điểm có kết nối với nhau.</p>
          </div>
      </div>
  </div>
</template>

<script setup>
const props = defineProps({
  path: Array,
  distance: Number,
  start: String,
  end: String
});
</script>
<style scoped>
/* 1. Ký hiệu Đỉnh trên đường đi */
.path-badge {
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px; /* Bo tròn dạng viên thuốc */
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 3px 6px rgba(0, 86, 179, 0.2);
  transition: transform 0.2s ease;
  display: inline-block;
}

.path-badge:hover {
  transform: translateY(-2px);
}

/* Mũi tên ngăn cách các đỉnh */
.fa-chevron-right {
  font-size: 0.8rem;
  color: #adb5bd !important;
  margin: 0 2px;
}

/* 2. Khối hiển thị Tổng Khoảng Cách */
.result-highlight-box {
  background-color: var(--accent-color);
  border: 2px dashed var(--primary-color);
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.result-highlight-box .fw-bold.text-primary {
  color: var(--primary-color) !important;
  font-size: 1.75rem !important;
  font-weight: 800 !important;
  font-family: 'Fira Code', monospace;
}

/* 3. Empty State (Khi chưa có kết quả) */
.text-muted {
  color: #6c757d !important;
  line-height: 1.6;
}

.fa-route {
  background: -webkit-linear-gradient(#ced4da, #adb5bd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.7;
}
</style>
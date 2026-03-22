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

              <div class="mt-4 small text-muted">
                  <i class="fas fa-info-circle me-1" style="color: var(--primary-color)"></i> 
                  Thuật toán tự động cập nhật khi cấu trúc đồ thị (đỉnh, cạnh, trọng số) thay đổi.
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
/* no additional scoped styles */
</style>
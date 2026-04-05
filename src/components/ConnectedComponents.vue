<template>
  <div class="card-component mt-3" style="flex: 1; min-height: 0;">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-project-diagram me-2"></i>Các Bộ Phận Liên Thông</span>
      <span class="badge bg-white text-primary border border-primary">{{ components.length }} Cụm</span>
    </div>
    <div class="card-body p-3 overflow-auto">
      <div v-if="components.length === 0" class="text-center text-muted mt-3">
        Chưa có dữ liệu đồ thị
      </div>
      <div v-else class="d-flex flex-column gap-2">
        <div 
          v-for="(comp, index) in components" 
          :key="index"
          class="p-2 border rounded"
          :class="{'bg-light': index % 2 === 0}"
        >
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="text-primary">Cụm {{ index + 1 }}</strong>
            <span class="badge bg-secondary">{{ comp.length }} đỉnh</span>
          </div>
          <div class="text-wrap" style="font-size: 0.9rem; line-height: 1.5;">
            {{ comp.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  components: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.card-component {
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color, #ffffff);
}

.card-header-component {
  background-color: var(--accent-color, #E1EFFF);
  color: var(--primary-color, #0056B3);
  font-weight: 700;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #dee2e6);
  border-radius: 12px 12px 0 0;
}

.card-body {
  flex: 1;
  overflow-y: auto;
}
</style>
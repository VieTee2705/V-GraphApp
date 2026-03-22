<template>
  <div class="card-component">
    <div class="card-header-component"><i class="fas fa-edit me-2"></i>Cấu hình Dữ Liệu</div>
    <div class="card-body">
      <!-- Thêm Đỉnh -->
      <section class="mb-4">
        <h6 class="fw-bold mb-3 text-main">1. Quản lý Đỉnh</h6>
        <div class="input-group">
          <input v-model="nodeId" @keyup.enter="submitNode" type="text" class="form-control" placeholder="Tên đỉnh (vd: E)">
          <button @click="submitNode" class="btn btn-primary-custom px-3">Thêm</button>
        </div>
      </section>

      <!-- Thêm Cạnh -->
      <section class="mb-4">
        <h6 class="fw-bold mb-3 text-main">2. Quản lý Cạnh (Vô Hướng)</h6>
        <div class="mb-2">
          <select v-model="edge.s" class="form-select mb-2">
            <option value="">Chọn điểm đầu</option>
            <option v-for="(n, id) in nodes" :key="id" :value="id">{{id}}</option>
          </select>
          <select v-model="edge.t" class="form-select mb-2">
            <option value="">Chọn điểm cuối</option>
            <option v-for="(n, id) in nodes" :key="id" :value="id">{{id}}</option>
          </select>
          <input v-model.number="edge.w" type="number" class="form-control mb-2" placeholder="Trọng số khoảng cách">
        </div>
        <button @click="submitEdge" class="btn btn-outline-custom w-100 btn-sm fw-bold">Thêm Cạnh</button>
      </section>

      <hr>

      <!-- Cấu hình Dijkstra -->
      <section>
        <h6 class="fw-bold mb-3" style="color: var(--primary-color)">3. Thuật toán Dijkstra</h6>
        <label class="small text-muted mb-1">Bắt đầu từ:</label>
        <select :value="start" @input="$emit('update:start', $event.target.value)" class="form-select mb-3">
            <option v-for="(n, id) in nodes" :value="id">{{id}}</option>
        </select>
        
        <label class="small text-muted mb-1">Đích đến:</label>
        <select :value="end" @input="$emit('update:end', $event.target.value)" class="form-select mb-2">
            <option v-for="(n, id) in nodes" :value="id">{{id}}</option>
        </select>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
export default {
  name: 'InputView',
  props: {
    nodes: Object,
    start: String,
    end: String
  },
  emits: ['add-node', 'add-edge', 'update:start', 'update:end'],
  setup(props, { emit }) {
    const nodeId = ref("");
    const edge = reactive({ s: "", t: "", w: 1 });

    const submitNode = () => {
        if (nodeId.value.trim()) {
            emit('add-node', nodeId.value.trim().toUpperCase());
            nodeId.value = "";
        }
    };

    const submitEdge = () => {
        if (edge.s && edge.t && edge.s !== edge.t) {
            emit('add-edge', { ...edge });
            edge.s = ""; edge.t = ""; edge.w = 1;
        }
    };

    return { nodeId, edge, submitNode, submitEdge };
  }
};
</script>

<style scoped>
/* shared styling handled globally */
</style>
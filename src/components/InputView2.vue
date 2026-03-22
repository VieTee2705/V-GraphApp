<!-- Input.vue -->
<template>
  <div class="card-component">
    <div class="card-header-component"><i class="fas fa-edit me-2"></i>Cấu hình Dữ Liệu</div>
    <div class="card-body">
      
      <section class="mb-4">
        <h6 class="fw-bold mb-3 text-main">1. Quản lý Đỉnh</h6>
        <div class="input-group">
          <input v-model="nodeId" @keyup.enter="submitNode" type="text" class="form-control" placeholder="Tên đỉnh (vd: E)">
          <button @click="submitNode" class="btn btn-primary-custom px-3">Thêm</button>
        </div>
      </section>

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

      <section class="mb-4">
        <h6 class="fw-bold mb-3" style="color: var(--primary-color)">3. Thuật toán Dijkstra</h6>
        <label class="small text-muted mb-1">Bắt đầu từ:</label>
        <select :value="start" @input="$emit('update:start', $event.target.value)" class="form-select mb-3">
            <option v-for="(n, id) in nodes" :key="'s-'+id" :value="id">{{id}}</option>
        </select>
        
        <label class="small text-muted mb-1">Đích đến:</label>
        <select :value="end" @input="$emit('update:end', $event.target.value)" class="form-select mb-2">
            <option v-for="(n, id) in nodes" :key="'e-'+id" :value="id">{{id}}</option>
        </select>
      </section>

      <hr>

      <section class="mb-4">
        <h6 class="fw-bold mb-3 text-success">4. Nhập nhanh từ File (.txt)</h6>
        <input type="file" @change="handleFileUpload" accept=".txt" class="form-control mb-2" />
        <div class="form-text small">
          <strong>Định dạng file:</strong> Mỗi dòng chứa <code>[Đỉnh 1] [Đỉnh 2] [Trọng số]</code> (cách nhau bởi khoảng trắng). <br/>
          <em>Ví dụ: A B 5</em>
        </div>
      </section>

      <hr>
<!-- 
      <section class="mb-4">
        <h6 class="fw-bold mb-3" style="color: var(--primary-color)">Thuật toán Djkstra</h6>
        <button 
          @click="$emit('run-algorithm')" 
          class="btn btn-success w-100 fw-bold mt-2"
          :disabled="!start || !end">
          Chạy thuật toán
        </button>
      </section> -->

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
  // Thêm event 'import-graph' để báo cho component cha biết có dữ liệu lớn cần thêm
  emits: ['add-node', 'add-edge', 'update:start', 'update:end', 'import-graph'],
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

    // Hàm xử lý khi người dùng upload file
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      
      // Khi file được đọc xong
      reader.onload = (e) => {
        const text = e.target.result;
        parseGraphData(text);
        // Reset input file để có thể upload lại cùng 1 file nếu cần
        event.target.value = null; 
      };

      // Báo lỗi nếu không đọc được
      reader.onerror = () => {
        alert("Có lỗi xảy ra khi đọc file!");
      };

      reader.readAsText(file); // Bắt đầu đọc file dưới dạng Text
    };

    // Hàm parse dữ liệu text thành đỉnh và cạnh
    const parseGraphData = (text) => {
      const lines = text.split('\n');
      const newNodes = new Set();
      const newEdges = [];

      lines.forEach(line => {
        // Cắt dòng theo các khoảng trắng (space, tab...)
        const parts = line.trim().split(/\s+/); 
        
        if (parts.length >= 2) {
          const u = parts[0].toUpperCase();
          const v = parts[1].toUpperCase();
          // Nếu không truyền trọng số, mặc định là 1
          const w = parts.length >= 3 ? parseFloat(parts[2]) : 1; 

          // Thêm đỉnh vào tập hợp (Set tự động loại bỏ trùng lặp)
          newNodes.add(u);
          newNodes.add(v);
          
          if (u !== v) {
            newEdges.push({ s: u, t: v, w: w });
          }
        }
      });

      // Phát event chứa toàn bộ dữ liệu lên component cha xử lý
      emit('import-graph', {
        nodes: Array.from(newNodes),
        edges: newEdges
      });
    };

    return { 
      nodeId, 
      edge, 
      submitNode, 
      submitEdge, 
      handleFileUpload 
    };
  }
};
</script>

<style scoped>
/* shared styling handled globally */
</style>
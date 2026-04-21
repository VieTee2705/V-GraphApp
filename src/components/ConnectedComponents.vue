<template>
  <div class="card-component mt-3 shadow-sm">
    <div class="card-header-component d-flex justify-content-between align-items-center bg-primary text-white p-3 rounded-top">
      <h5 class="mb-0"><i class="fas fa-project-diagram me-2"></i>Sơ Đồ Các Bộ Phận Liên Thông</h5>
      <span class="badge bg-white text-primary rounded-pill">{{ components.length }} Cụm</span>
    </div>
    
    <div class="card-body p-4 overflow-auto" style="max-height: 85vh; background-color: #f8f9fa;">
      <div v-if="components.length === 0" class="text-center py-5 text-muted">
        <i class="fas fa-ghost fa-3x mb-3"></i>
        <p>Chưa có dữ liệu đồ thị để phân tích.</p>
      </div>

      <div v-else class="d-flex flex-column gap-5">
        <div 
          v-for="(comp, index) in components" 
          :key="index"
          class="graph-component-box w-100"
        >
          <div class="d-flex align-items-center mb-2">
            <div class="flex-grow-1 border-bottom"></div>
            <span class="px-3 fw-bold text-primary text-uppercase small">
              Thành phần {{ index + 1 }} ({{ comp.nodeIds.length }} đỉnh)
            </span>
            <div class="flex-grow-1 border-bottom"></div>
          </div>
          
          <div class="graph-container border border-primary rounded shadow-sm" style="background-color: #ffffff;">
            <div 
              :ref="el => { if (el) graphRefs[index] = el }" 
              class="network-canvas"
            ></div>
          </div>

          <div class="node-list-panel mt-2 p-3 bg-white border rounded shadow-sm">
            <div class="text-muted small fw-bold mb-2 text-uppercase">
              <i class="fas fa-list-ul me-1"></i> Danh sách các đỉnh trong cụm:
            </div>
            <div class="d-flex flex-wrap gap-2">
              <span 
                v-for="nodeId in comp.nodeIds" 
                :key="nodeId" 
                class="node-badge"
              >
                {{ nodeId }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onBeforeUpdate } from 'vue';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';

const props = defineProps({
  components: {
    type: Array,
    default: () => []
  },
  isDirected: {
    type: Boolean,
    default: true
  }
});

const graphRefs = ref([]);
let networks = [];

onBeforeUpdate(() => {
  graphRefs.value = [];
});

const drawGraphs = async () => {
  await nextTick();
  
  networks.forEach(net => net.destroy());
  networks.length = 0;

  props.components.forEach((comp, index) => {
    const container = graphRefs.value[index];
    if (!container) return;

    const nodes = comp.nodeIds.map(nodeId => ({
      id: nodeId,
      label: String(nodeId),
      shape: 'circle',
      color: { 
        background: '#0d6efd', 
        border: '#004aad',
        highlight: { background: '#ffc107', border: '#ff9800' }
      },
      font: { color: 'white', size: 16, bold: true },
      borderWidth: 2
    }));

    const edges = comp.edges.map(edge => ({
      from: String(edge.source),
      to: String(edge.target),
      arrows: props.isDirected ? 'to' : '',
      color: { color: '#6c757d', opacity: 0.6 },
      width: 2,
      smooth: { type: 'curvedCW', roundness: 0.2 }
    }));

    const data = { nodes, edges };
    const options = {
      physics: { 
        enabled: true, 
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -100,
          springLength: 100,
          springConstant: 0.08
        },
        stabilization: { iterations: 100 }
      },
      interaction: { 
        zoomView: true, 
        dragView: true,
        hover: true
      }
    };

    networks.push(new Network(container, data, options));
  });
};

watch(() => props.components, drawGraphs, { deep: true });
onMounted(drawGraphs);
</script>

<style scoped>
.graph-component-box {
  max-width: 800px; /* Tăng chiều rộng tối đa của mỗi cụm */
  margin: 0 auto;
}

.graph-container {
  padding: 5px;
  position: relative;
  overflow: hidden;
}

.network-canvas {
  width: 100%;
  height: 450px; /* Đã tăng chiều cao từ 250px lên 450px */
  outline: none;
  cursor: grab;
}

.network-canvas:active {
  cursor: grabbing;
}

/* Style cho các badge danh sách node */
.node-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 12px;
  border-radius: 50px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 0.9rem;
  border: 1px solid #dee2e6;
  transition: all 0.2s;
}

.node-badge:hover {
  background-color: #0d6efd;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.node-list-panel {
  border-top: none !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}
</style>
<template>
  <div class="card-component graph-card">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-network-wired me-2"></i>Trực Quan Hóa Đồ Thị</span>
      <span class="badge bg-white text-primary border border-primary">Shift + Click để thêm đỉnh / Nối cạnh</span>
    </div>
    <div class="card-body p-0 graph-wrapper position-relative">
      <v-network-graph
        ref="graphRef"
        :nodes="nodes"
        :edges="edges"
        :layouts="layouts"
        :configs="configs"
        :paths="pathData"
        :event-handlers="eventHandlers"
        v-model:selected-nodes="selectedNodesModel"
        v-model:selected-edges="selectedEdgesModel"
      >
        <template #edge-label="{ edge, ...slotProps }">
          <v-edge-label
            :text="String(edge.weight)"
            :align="'center'"
            :vertical-align="'above'"
            v-bind="slotProps"
            style="font-size: 14px; font-weight: bold; fill: #1A1A1B;"
          />
        </template>
      </v-network-graph>

      <!-- Floating input for Edge weight -->
      <div v-if="showWeightInput" class="weight-input-overlay" :style="{ left: inputPos.x + 'px', top: inputPos.y + 'px' }">
        <input 
          ref="weightInputRef"
          type="number" 
          v-model.number="weightInputValue" 
          @keyup.enter="confirmEdge"
          @keyup.esc="cancelEdge"
          class="weight-input"
        />
        <span class="weight-hint">Enter để lưu</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch, nextTick } from 'vue';
import { ForceLayout } from 'v-network-graph/lib/force-layout';

const props = defineProps({
  nodes: { type: Object, required: true },
  edges: { type: Object, required: true },
  layouts: { type: Object, required: true },
  graphConfig: { type: Object, default: () => ({}) },
  selectedNodes: { type: Array, default: () => [] },
  selectedEdges: { type: Array, default: () => [] },
  isDirected: { type: Boolean, default: false },
  
  // Props mới phục vụ Animation
  animCurrentNode: { type: String, default: null },
  animNeighborNode: { type: String, default: null },
  animVisitedNodes: { type: Object, default: () => new Set() },
  animPathEdges: { type: Array, default: () => [] }
});

const emit = defineEmits(['create-node', 'create-edge', 'update:selectedNodes', 'update:selectedEdges']);

const selectedNodesModel = computed({
  get: () => props.selectedNodes,
  set: (val) => emit('update:selectedNodes', val)
});

const selectedEdgesModel = computed({
  get: () => props.selectedEdges,
  set: (val) => emit('update:selectedEdges', val)
});

const graphRef = ref(null);

// Trạng thái cho việc nối cạnh
const selectedSourceNode = ref(null);
const showWeightInput = ref(false);
const inputPos = reactive({ x: 0, y: 0 });
const pendingEdge = reactive({ source: '', target: '' });
const weightInputValue = ref(1);
const weightInputRef = ref(null);

const eventHandlers = {
  "view:click": (payload) => {
    const mouseEvent = payload.event || payload;
    if (showWeightInput.value) { cancelEdge(); return; }
    selectedSourceNode.value = null;
    if (!mouseEvent.shiftKey) return;
    if (!graphRef.value) return;

    const domPoint = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
    const svgPoint = graphRef.value.translateFromDomToSvgCoordinates(domPoint);

    emit('create-node', { x: svgPoint.x, y: svgPoint.y });
  },
  "node:click": (payload) => {
    const mouseEvent = payload.event || payload.event;
    const nodeId = payload.node;
    
    if (showWeightInput.value) return; 

    if (!mouseEvent.shiftKey) {
        selectedSourceNode.value = null;
        return;
    }

    if (!selectedSourceNode.value) {
      selectedSourceNode.value = nodeId;
    } else {
      if (selectedSourceNode.value === nodeId) return; 
      
      pendingEdge.source = selectedSourceNode.value;
      pendingEdge.target = nodeId;
      
      const sNode = props.layouts.nodes[pendingEdge.source];
      const tNode = props.layouts.nodes[pendingEdge.target];
      const svgMid = { x: (sNode.x + tNode.x) / 2, y: (sNode.y + tNode.y) / 2 };
      
      const domMid = graphRef.value.translateFromSvgToDomCoordinates(svgMid);
      inputPos.x = domMid.x;
      inputPos.y = domMid.y;
      
      weightInputValue.value = 1; 
      showWeightInput.value = true;
      
      nextTick(() => { if (weightInputRef.value) weightInputRef.value.focus(); });
      selectedSourceNode.value = null; 
    }
  }
};

const confirmEdge = () => {
  if (pendingEdge.source && pendingEdge.target) {
    emit('create-edge', {
      source: pendingEdge.source,
      target: pendingEdge.target,
      weight: Number(weightInputValue.value) || 0
    });
  }
  cancelEdge();
};

const cancelEdge = () => {
  showWeightInput.value = false;
  pendingEdge.source = '';
  pendingEdge.target = '';
};

// Cấu hình reactive để auto update màu khi prop anim* thay đổi
const createConfigs = () => {
  const cfg = props.graphConfig || {};
  return {
    view: {
      panEnabled: true,
      zoomEnabled: true,
      doubleClickZoomEnabled: true,
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: false,
        createSimulation: (d3, nodes, edges) => {
          const forceLink = d3.forceLink(edges).id(d => d.id).distance(cfg.distanceMin || 120);
          return d3.forceSimulation(nodes)
            .force('edge', forceLink)
            .force('charge', d3.forceManyBody().strength(cfg.chargeStrength || -400))
            .force('center', d3.forceCenter())
            .alphaMin(cfg.alphaMin || 0.001);
        }
      })
    },
    node: {
      selectable: true,
      normal: {
        radius: cfg.nodeRadius || 25,
        // Thay đổi Logic tô màu dựa trên các biến Animation
        color: node => {
          if (node.id === props.animCurrentNode) return '#ffc107'; // Vàng (Đang xét)
          if (node.id === props.animNeighborNode) return '#28a745'; // Xanh lá (Lân cận)
          if (props.animVisitedNodes.has(node.id)) return '#6c757d'; // Xám (Đã duyệt)
          if (node.id === selectedSourceNode.value) return '#ffc107'; // Vàng (Đang chọn vẽ cạnh)
          return cfg.nodeColor || '#E1EFFF'; // Mặc định
        },
        strokeWidth: 3,
        strokeColor: node => {
          if (node.id === props.animCurrentNode) return '#d39e00'; // Viền vàng đậm
          if (node.id === props.animNeighborNode) return '#1e7e34'; // Viền xanh lá đậm
          if (props.animVisitedNodes.has(node.id)) return '#495057'; // Viền xám đậm
          if (node.id === selectedSourceNode.value) return '#d39e00';
          return cfg.nodeStrokeColor || '#0056B3';
        }
      },
      hover: { color: cfg.nodeHoverColor || '#0056B3' },
      label: { visible: true, fontFamily: 'Inter', fontWeight: 'bold', color: '#1A1A1B' }
    },
    edge: {
      selectable: true,
      normal: {
        // Đổi màu cạnh nối giữa Node hiện tại và Neighbor
        color: edge => {
          if (props.animCurrentNode && props.animNeighborNode) {
            if ((edge.source === props.animCurrentNode && edge.target === props.animNeighborNode) ||
                (edge.target === props.animCurrentNode && edge.source === props.animNeighborNode)) {
              return '#fd7e14'; // Cam nổi bật
            }
          }
          return cfg.edgeColor || '#cccccc';
        },
        width: edge => {
          if (props.animCurrentNode && props.animNeighborNode) {
             if ((edge.source === props.animCurrentNode && edge.target === props.animNeighborNode) ||
                (edge.target === props.animCurrentNode && edge.source === props.animNeighborNode)) {
              return 6; // Dày hơn bình thường khi duyệt
            }
          }
          return cfg.edgeWidth || 3;
        }
      },
      marker: {
        target: { type: props.isDirected ? 'arrow' : 'none', width: 5, height: 5, margin: -1 }
      },
      label: { fontSize: 13, color: '#1A1A1B', fontWeight: 'bold' },
      type: 'curve',
      gap: cfg.edgeGap || 40,
      margin: 6
    },
    path: {
      visible: true,
      normal: { width: cfg.pathWidth || 6, color: cfg.pathColor || '#0056B3', dasharray: '0' }
    }
  };
};

const configs = reactive(createConfigs());

// Vì cấu hình màu là các function nhận `node`/`edge` từ thư viện và đọc `props`, 
// ta chỉ cần gán lại configs khi graphConfig từ bên ngoài bị thay đổi tổng quát
watch(() => props.graphConfig, () => { Object.assign(configs, createConfigs()); }, { deep: true });
watch(() => props.isDirected, (newVal) => { if (configs.edge && configs.edge.marker) configs.edge.marker.target.type = newVal ? 'arrow' : 'none'; });

// Cập nhật lại đường đi (Path) dựa trên dữ liệu Animation
const pathData = computed(() => {
  if (!props.animPathEdges || props.animPathEdges.length === 0) return {};
  return { shortestPath: { edges: props.animPathEdges } };
});

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportGraph = async (format) => {
  if (!graphRef.value) return;
  try {
    const svgText = await graphRef.value.getAsSvg();
    if (format === 'svg') {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      downloadFile(blob, `graph_${Date.now()}.svg`);
      return;
    }
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    let width = parseFloat(svgElement.getAttribute("width"));
    let height = parseFloat(svgElement.getAttribute("height"));
    if (!width || !height) {
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const vbParts = viewBox.split(" ");
        width = parseFloat(vbParts[2]);
        height = parseFloat(vbParts[3]);
        svgElement.setAttribute("width", width);
        svgElement.setAttribute("height", height);
      } else {
        width = 800; height = 600;
      }
    }
    const serializer = new XMLSerializer();
    const updatedSvgText = serializer.serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (format === 'jpeg') {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }
    const img = new Image();
    const svgBlob = new Blob([updatedSvgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url); 
      canvas.toBlob((blob) => {
        if (blob) {
          const ext = format === 'jpeg' ? 'jpg' : 'png';
          downloadFile(blob, `graph_${Date.now()}.${ext}`);
        }
      }, `image/${format}`, 1.0); 
    };
    img.src = url;
  } catch (error) { console.error("Lỗi khi xuất đồ thị:", error); }
};

defineExpose({ exportGraph });
</script>

<style scoped>
.card-component { border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); height: 100%; max-height: 100%; display: flex; flex-direction: column; background-color: var(--bg-color); overflow: auto; }
.card-header-component { background-color: var(--accent-color); color: var(--primary-color); font-weight: 700; padding: 1rem; border-bottom: 1px solid var(--border-color); border-radius: 12px 12px 0 0; }
.card-body { flex: 1; min-height: 0; }
.graph-wrapper { flex-grow: 1; min-height: 0; background-image: radial-gradient(#d1d1d1 1px, transparent 1px); background-size: 20px 20px; border-radius: 0 0 12px 12px; overflow: hidden; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
.position-relative { position: relative; }
.weight-input-overlay { position: absolute; transform: translate(-50%, -50%); z-index: 1000; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); padding: 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border: 1px solid rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; align-items: center; gap: 4px; }
.weight-input { width: 60px; text-align: center; font-weight: bold; border: 2px solid var(--primary-color); border-radius: 4px; outline: none; background: transparent; color: var(--text-main); padding: 2px; }
.weight-input:focus { background: rgba(255, 255, 255, 0.9); }
.weight-hint { font-size: 11px; color: #555; font-weight: 600; }
</style>
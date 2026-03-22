<template>
  <div class="card-component graph-card">
    <div class="card-header-component d-flex justify-content-between align-items-center">
      <span><i class="fas fa-network-wired me-2"></i>Trực Quan Hóa Đồ Thị</span>
      <span class="badge bg-white text-primary border border-primary">Kéo thả để di chuyển</span>
    </div>
    <div class="card-body p-0 graph-wrapper">
      
      <v-network-graph
          :nodes="nodes"
          :edges="edges"
          :configs="configs"
          :paths="pathData"
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
      
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { ForceLayout } from 'v-network-graph/lib/force-layout';

const props = defineProps({
  nodes: Object,
  edges: Object,
  pathIds: Array
});

const configs = reactive({
  view: {
    panEnabled: true,
    zoomEnabled: true,
    // ForceLayout tự động dàn trang và tạo độ căng cạnh hợp lý
    layoutHandler: new ForceLayout({
      positionFixedByDrag: false,
      positionFixedByClickWithAltKey: false,
      // Tùy chỉnh lực kéo/đẩy cho vừa mắt
      createSimulation: (d3, nodes, edges) => {
        const forceLink = d3
          .forceLink(edges)
          .id(d => d.id)
          .distance(120); // Độ dài cạnh (tăng = dàn ra, giảm = chặt lại)
        
        return d3.forceSimulation(nodes)
          .force('edge', forceLink)
          .force('charge', d3.forceManyBody().strength(-400)) // Lực đẩy (-400 = đẩy mạnh)
          .force('center', d3.forceCenter()) // Giữ đứng ở giữa
          .alphaMin(0.001); // Độ nhạy cảm của mô phỏng (nhỏ = tính toán lâu hơn, chi tiết hơn)
      }
    })
  },
  node: {
    selectable: true,
    normal: {
      radius: 15,
      color: "#E1EFFF",
      strokeWidth: 3,
      strokeColor: "#0056B3"
    },
    hover: { color: "#0056B3" },
    label: { visible: true, fontFamily: "Inter", fontWeight: "bold", color: "#1A1A1B" }
  },
  edge: {
    normal: { color: "#cccccc", width: 3 },
    label: { fontSize: 13, color: "#1A1A1B", fontWeight: "bold" },
    type: "curve",
    gap: 30, // Khoảng cách giữa cạnh nối cùng 2 node
    margin: 6 // Khoảng cách từ mút cạnh tới viền node
  },
  path: {
    visible: true,
    normal: { width: 6, color: "#0056B3", dasharray: "0" }
  }
});

const pathData = computed(() => {
  if (!props.pathIds || props.pathIds.length === 0) return {};
  return { shortestPath: { edges: props.pathIds } };
});
</script>

<style scoped>
/* graph-wrapper defined globally */
</style>
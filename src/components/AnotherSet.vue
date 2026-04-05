<template>
  <div class="container-fluid h-100 d-flex flex-column p-0 settings-container overflow-hidden" style="min-height: 0;">
    
    <ul class="nav nav-pills mb-2 px-3 pt-3 flex-shrink-0" id="pills-tab" role="tablist">
      <li class="nav-item" v-for="tab in tabs" :key="tab.id">
        <button 
          class="nav-link nav-link-sm" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          type="button"
        >
          {{ tab.title }}
        </button>
      </li>
    </ul>

    <div class="tab-content flex-grow-1 overflow-y-auto px-3 pb-3" style="min-height: 0;">
      
      <div v-if="activeTab === 'path'" class="tab-pane fade show active">
        <ResultView 
            :path="result.path"
            :distance="result.totalDistance"
            :start="start"
            :end="end"
        />
      </div>

      <div v-if="activeTab === 'guidance'" class="tab-pane fade show active">
        <h5 class="fw-bold mb-3" style="color: var(--primary-color)">📖 Hướng Dẫn Sử Dụng</h5>
        <div class="guidance-content">
          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main">1️⃣ Quản lý Đỉnh (Node)</h6>
            <p class="small text-muted mb-2">Nhập tên đỉnh (A, B, C, ...) và bấm <strong>"Thêm"</strong> hoặc Enter.</p>
            <div class="alert alert-info alert-small">
              <i class="fas fa-lightbulb me-1"></i> <strong>Mẹo:</strong> Double-click trên canvas để tạo đỉnh nhanh
            </div>
          </div>

          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main">2️⃣ Quản lý Cạnh (Edge)</h6>
            <p class="small text-muted mb-2">Chọn 2 đỉnh và nhập trọng số (khoảng cách), sau đó bấm <strong>"Thêm Cạnh"</strong>.</p>
            <div class="alert alert-info alert-small">
              <i class="fas fa-lightbulb me-1"></i> <strong>Mẹo:</strong> Trọng số phải > 0 và 2 đỉnh khác nhau
            </div>
          </div>

          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main">3️⃣ Nhập Dữ Liệu từ File</h6>
            <p class="small text-muted mb-2">Upload file <code>.txt</code> với định dạng:</p>
            <div class="bg-light p-2 rounded small font-monospace mb-2">
              A B 5<br/>
              B C 3<br/>
              A C 7
            </div>
            <p class="small text-muted">Mỗi dòng: <strong>[Đỉnh 1] [Đỉnh 2] [Trọng số]</strong></p>
          </div>

          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main">4️⃣ Tính Toán Dijkstra</h6>
            <p class="small text-muted mb-2">Chọn đỉnh bắt đầu và kết thúc, sau đó bấm <strong>"RUN"</strong> ở navbar dưới.</p>
            <div class="alert alert-info alert-small">
              <i class="fas fa-lightbulb me-1"></i> Kết quả hiển thị ở tab "Đường đi ngắn nhất"
            </div>
          </div>

          <div class="guide-section">
            <h6 class="fw-bold text-main">🎮 Tương Tác Canvas</h6>
            <ul class="small text-muted">
              <li><strong>Kéo nút:</strong> Di chuyển đỉnh trên canvas</li>
              <li><strong>Scroll:</strong> Phóng to / thu nhỏ</li>
              <li><strong>Double-click:</strong> Tạo đỉnh tại vị trí đó</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'settings'" class="tab-pane fade show active">
        <h5 class="fw-bold mb-3" style="color: var(--primary-color)">⚙️ Cài Đặt Đồ Thị</h5>
        
        <div class="settings-content">
          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-2">📏 Lực Bố Cục (Force Layout)</h6>
            
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ dài cạnh (Distance):</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.distanceMin" 
                  type="range" 
                  min="50" 
                  max="300" 
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-primary">{{ graphConfig.distanceMin }}</span>
              </div>
              <small class="text-muted">Tăng = các nút dàn ra hơn</small>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Lực đẩy (Charge Strength):</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.chargeStrength" 
                  type="range" 
                  min="-600" 
                  max="-100" 
                  step="50"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-danger">{{ graphConfig.chargeStrength }}</span>
              </div>
              <small class="text-muted">Âm nhiều hơn = đẩy mạnh hơn</small>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ nhạy mô phỏng (Alpha Min):</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.alphaMin" 
                  type="range" 
                  min="0.0001" 
                  max="0.01" 
                  step="0.0001"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-secondary">{{ graphConfig.alphaMin.toFixed(4) }}</span>
              </div>
              <small class="text-muted">Nhỏ = tính toán chính xác hơn (chậm hơn)</small>
            </div>
          </div>

          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-2">⭕ Cấu Hình Nút (Node)</h6>
            
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Bán kính nút:</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.nodeRadius" 
                  type="range" 
                  min="10" 
                  max="40"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-primary">{{ graphConfig.nodeRadius }}</span>
              </div>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu nút:</label>
              <input 
                v-model="graphConfig.nodeColor" 
                type="color" 
                class="form-control form-control-color"
                style="height: 35px;"
              >
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu viền:</label>
              <input 
                v-model="graphConfig.nodeStrokeColor" 
                type="color" 
                class="form-control form-control-color"
                style="height: 35px;"
              >
            </div>
          </div>

          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-2">━ Cấu Hình Cạnh (Edge)</h6>
            
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ rộng cạnh:</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.edgeWidth" 
                  type="range" 
                  min="1" 
                  max="8"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-primary">{{ graphConfig.edgeWidth }}</span>
              </div>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Khoảng cách cạnh (Gap):</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.edgeGap" 
                  type="range" 
                  min="10" 
                  max="60"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-primary">{{ graphConfig.edgeGap }}</span>
              </div>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu cạnh:</label>
              <input 
                v-model="graphConfig.edgeColor" 
                type="color" 
                class="form-control form-control-color"
                style="height: 35px;"
              >
            </div>
          </div>

          <div class="setting-section">
            <h6 class="fw-bold text-main mb-2">✨ Cấu Hình Đường Đi (Path)</h6>
            
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ rộng đường đi:</label>
              <div class="d-flex align-items-center gap-2">
                <input 
                  v-model.number="graphConfig.pathWidth" 
                  type="range" 
                  min="2" 
                  max="12"
                  class="form-range flex-grow-1"
                >
                <span class="badge bg-success">{{ graphConfig.pathWidth }}</span>
              </div>
            </div>

            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu đường đi:</label>
              <input 
                v-model="graphConfig.pathColor" 
                type="color" 
                class="form-control form-control-color"
                style="height: 35px;"
              >
            </div>
          </div>

          <button 
            @click="resetSettings" 
            class="btn btn-outline-secondary btn-sm w-100 mt-4"
          >
            <i class="fas fa-undo me-1"></i> Đặt lại mặc định
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import ResultView from './ResultView.vue';

const props = defineProps({
  result: Object,
  start: String,
  end: String,
  graphConfig: Object
});

const emit = defineEmits(['update-config']);

// Quản lý ID của tab đang mở
const activeTab = ref('path');

// Danh sách các tab
const tabs = [
  { id: 'guidance', title: '📖 Hướng dẫn' },
  { id: 'path', title: '🎯 Đường đi' },
  { id: 'settings', title: '⚙️ Cài đặt' }
];

// Default config values
const defaultConfig = {
  distanceMin: 120,
  chargeStrength: -400,
  alphaMin: 0.001,
  nodeRadius: 25,
  nodeColor: '#E1EFFF',
  nodeStrokeColor: '#0056B3',
  edgeWidth: 3,
  edgeGap: 40,
  edgeColor: '#cccccc',
  pathWidth: 6,
  pathColor: '#0056B3'
};

// Graph config state - sync with parent
const graphConfig = reactive({ ...defaultConfig });

// Sync when parent config changes
watch(() => props.graphConfig, (newConfig) => {
  if (newConfig) {
    Object.assign(graphConfig, newConfig);
  }
}, { deep: true });

// Emit changes in real-time to parent
watch(graphConfig, (newConfig) => {
  emit('update-config', { ...newConfig });
}, { deep: true });

const resetSettings = () => {
  Object.assign(graphConfig, defaultConfig);
  emit('update-config', { ...defaultConfig });
};
</script>

<style scoped>
.settings-container {
  background-color: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-link-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-main);
  flex-shrink: 0;
}

.nav-link-sm.active {
  background-color: var(--primary-color);
  color: white;
}

.tab-content {
  background-color: var(--bg-color);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-pane {
  padding: 0.5rem 0;
}

.guidance-content {
  padding: 0.5rem 0;
  overflow: hidden;
}

.guide-section {
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.guide-section h6 {
  color: var(--text-main);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.alert-small {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  border-radius: 4px;
}

.alert-info.alert-small {
  background-color: #cfe2ff;
  border-color: #b6d4fe;
  color: #084298;
}

.settings-content {
  padding: 0;
  overflow: hidden;
}

.setting-section {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  margin-bottom: 0.75rem;
}

.setting-section h6 {
  color: var(--text-main);
  font-size: 0.95rem;
}

.form-range {
  height: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.5rem;
  min-width: 50px;
  text-align: center;
}

.form-control-color {
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.form-control-color:hover {
  border-color: var(--primary-color);
}

code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  color: #d63384;
  font-size: 0.85rem;
}
</style>
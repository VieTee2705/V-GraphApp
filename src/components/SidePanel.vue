<template>
  <div class="container-fluid h-100 d-flex flex-column p-0 settings-container overflow-hidden" style="min-height: 0;">
    
    <ul class="nav nav-pills mb-2 px-3 pt-3 flex-shrink-0" id="pills-tab" role="tablist">
      <li class="nav-item" v-for="tab in tabs" :key="tab.id">
        <button 
          class="nav-link nav-link-sm d-flex align-items-center justify-content-center" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          type="button"
        >
          <i :class="tab.icon + ' me-2'"></i> {{ tab.title }}
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
        <h5 class="fw-bold mb-3" style="color: var(--primary-color)">
          <i class="fas fa-book-open me-2"></i>Hướng Dẫn Sử Dụng
        </h5>
        
        <div class="guidance-content">
          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main"><i class="fas fa-keyboard me-2"></i>1. Nhập Dữ Liệu</h6>
            <ul class="small text-muted ps-3 mb-0" style="line-height: 1.8;">
              <li>Nhập tên đỉnh/cạnh vào form <strong>Cấu hình dữ liệu</strong>.</li>
              <li>Upload file văn bản <strong>(.txt)</strong> chứa cấu trúc đồ thị.</li>
              <li>Thao tác chuột kết hợp phím <strong>(Shift + Click)</strong> trực tiếp trên Canvas.</li>
            </ul>
          </div>

          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main"><i class="fas fa-paint-roller me-2"></i>2. Cấu Hình Đồ Thị</h6>
            <p class="small text-muted mb-0">Các tùy chọn trong bảng <strong>Cài đặt</strong> cho phép cấu hình đồ thị như: Bật/tắt chế độ vật lý (lực bố cục) và đổi màu sắc đỉnh/cạnh.</p>
          </div>

          <div class="guide-section mb-4">
            <h6 class="fw-bold text-main"><i class="fas fa-route me-2"></i>3. Tìm Đường Đi (Dijkstra)</h6>
            <p class="small text-muted mb-2">Thực hiện tìm đường đi ngắn nhất giữa hai đỉnh bằng thuật toán Dijkstra và trực quan hóa kết quả lên đồ thị.</p>
            <div class="alert alert-info alert-small">
              <i class="fas fa-mouse-pointer me-1"></i> <strong>Thao tác:</strong> Chọn "Đỉnh bắt đầu" và "Đích đến" trong bảng cấu hình, sau đó nhấn nút <strong>"RUN"</strong> trên thanh công cụ.
            </div>
          </div>

          <div class="guide-section mb-2">
            <h6 class="fw-bold text-main"><i class="fas fa-camera-retro me-2"></i>4. Xuất Hình Ảnh</h6>
            <p class="small text-muted mb-2">Cho phép lưu hình ảnh đồ thị đang hiển thị trên Canvas về máy tính cá nhân.</p>
            <div class="alert alert-info alert-small">
              <i class="fas fa-mouse-pointer me-1"></i> <strong>Thao tác:</strong> Chọn định dạng ảnh (SVG, PNG, JPG) từ dropdown menu và nhấn nút <strong>"EXPORT"</strong>.
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'settings'" class="tab-pane fade show active">
        <h5 class="fw-bold mb-3" style="color: var(--primary-color)">
          <i class="fas fa-sliders-h me-2"></i>Cài Đặt Đồ Thị
        </h5>
        
        <div class="settings-content">
          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-3"><i class="fas fa-magnet me-2"></i>Lực Bố Cục (Force Layout)</h6>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ dài cạnh (Distance):</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.distanceMin" type="range" min="50" max="300" class="form-range flex-grow-1">
                <span class="badge bg-primary">{{ graphConfig.distanceMin }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Lực đẩy (Charge Strength):</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.chargeStrength" type="range" min="-600" max="-100" step="50" class="form-range flex-grow-1">
                <span class="badge bg-danger">{{ graphConfig.chargeStrength }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ nhạy (Alpha Min):</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.alphaMin" type="range" min="0.0001" max="0.01" step="0.0001" class="form-range flex-grow-1">
                <span class="badge bg-secondary">{{ graphConfig.alphaMin.toFixed(4) }}</span>
              </div>
            </div>
          </div>

          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-3"><i class="fas fa-dot-circle me-2"></i>Cấu Hình Đỉnh (Node)</h6>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Bán kính nút:</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.nodeRadius" type="range" min="10" max="40" class="form-range flex-grow-1">
                <span class="badge bg-primary">{{ graphConfig.nodeRadius }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu nút:</label>
              <input v-model="graphConfig.nodeColor" type="color" class="form-control form-control-color" style="height: 35px;">
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu viền:</label>
              <input v-model="graphConfig.nodeStrokeColor" type="color" class="form-control form-control-color" style="height: 35px;">
            </div>
          </div>

          <div class="setting-section mb-4">
            <h6 class="fw-bold text-main mb-3"><i class="fas fa-draw-polygon me-2"></i>Cấu Hình Cạnh (Edge)</h6>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ rộng cạnh:</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.edgeWidth" type="range" min="1" max="8" class="form-range flex-grow-1">
                <span class="badge bg-primary">{{ graphConfig.edgeWidth }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Khoảng cách cạnh (Gap):</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.edgeGap" type="range" min="10" max="60" class="form-range flex-grow-1">
                <span class="badge bg-primary">{{ graphConfig.edgeGap }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu cạnh:</label>
              <input v-model="graphConfig.edgeColor" type="color" class="form-control form-control-color" style="height: 35px;">
            </div>
          </div>

          <div class="setting-section">
            <h6 class="fw-bold text-main mb-3"><i class="fas fa-map-marked-alt me-2"></i>Cấu Hình Đường Đi (Path)</h6>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Độ rộng đường đi:</label>
              <div class="d-flex align-items-center gap-2">
                <input v-model.number="graphConfig.pathWidth" type="range" min="2" max="12" class="form-range flex-grow-1">
                <span class="badge bg-success">{{ graphConfig.pathWidth }}</span>
              </div>
            </div>
            <div class="mb-3">
              <label class="small fw-bold text-muted d-block mb-1">Màu đường đi:</label>
              <input v-model="graphConfig.pathColor" type="color" class="form-control form-control-color" style="height: 35px;">
            </div>
          </div>

          <button @click="resetSettings" class="btn btn-outline-secondary w-100 mt-4 mb-2" style="border-radius: 8px;">
            <i class="fas fa-undo me-2"></i>Đặt lại mặc định
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

const tabs = [
  { id: 'guidance', icon: 'fas fa-book', title: 'Hướng dẫn' },
  { id: 'path', icon: 'fas fa-project-diagram', title: 'Đường đi' },
  { id: 'settings', icon: 'fas fa-cog', title: 'Cài đặt' }
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
/* 1. Layout Container */
.settings-container {
  background-color: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* 2. Thiết kế Tabs (Segmented Control phong cách hiện đại) */
.nav-pills {
  background-color: #f1f3f5;
  border-radius: 10px;
  padding: 4px !important;
  display: flex;
  gap: 2px;
  margin: 12px 12px 8px 12px;
}

.nav-item {
  flex: 1;
}

.nav-link-sm {
  width: 100%;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  background: transparent;
  border: none;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.nav-link-sm:hover:not(.active) {
  color: var(--text-main);
}

.nav-link-sm.active {
  background-color: var(--bg-color) !important;
  color: var(--primary-color) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* 3. Nội dung Tab & Thanh cuộn */
.tab-content {
  background-color: var(--bg-color);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-top: 8px;
}

.tab-content::-webkit-scrollbar { width: 6px; }
.tab-content::-webkit-scrollbar-track { background: transparent; }
.tab-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

/* 4. Phần Hướng Dẫn (Guidance) */
.guide-section h6 {
  color: var(--primary-color);
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
}

.alert-small {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 8px;
  border: none;
  background-color: var(--accent-color);
  color: var(--primary-color);
}

code {
  background-color: #f1f3f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #d63384;
  font-family: 'Fira Code', monospace;
}

/* 5. Khối Cài Đặt (Settings Sections) */
.setting-section {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid var(--primary-color);
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.setting-section h6 {
  color: var(--text-main);
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 1rem !important;
}

/* 6. Thanh trượt Slider đồng bộ Toolbar */
.form-range {
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: var(--primary-color);
  border: 2px solid white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.form-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.badge {
  font-size: 0.75rem;
  font-family: 'Fira Code', monospace;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

/* 7. Color Picker */
.form-control-color {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  width: 100%;
}
</style>
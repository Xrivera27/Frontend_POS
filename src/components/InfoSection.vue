<template>
  <div class="info-line-container">
    <div class="info-wrapper">
      <div class="info-button" @click="isExpanded = !isExpanded">
        <i class="bi bi-info-circle-fill info-icon"></i>
      </div>
      <hr class="divider" />
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="info-content">
        <p>{{ descripcion }}</p>
        <ul>
          <li v-for="(funcion, index) in funciones" :key="index">
            {{ funcion }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "InfoSection",
  props: {
    descripcion: {
      type: String,
      required: true,
    },
    funciones: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
};
</script>

<style scoped>
.info-line-container {
  padding: 0 16px;
  margin-bottom: 30px;
}

.info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-button {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.info-icon {
  font-size: 20px;
  color: #c09d62;
  transition: color 0.3s ease;
}

.info-icon:hover {
  color: #a38655;
}

.divider {
  flex: 1;
  border: none;
  border-top: 3px solid #e0e0e0;
  margin: 0;
}

.info-content {
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(192, 157, 98, 0.1);
  border-radius: 8px;
  color: #333;
}

.info-content p {
  margin-bottom: 12px;
}

.info-content ul {
  list-style: none;
  padding-left: 0;
}

.info-content li {
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.info-content li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  background-color: #c09d62;
  border-radius: 50%;
}

:deep(.dark) .info-content {
  background-color: rgba(192, 157, 98, 0.15);
  color: #e5e7eb;
}

:deep(.dark) .divider {
  border-color: #404040;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>

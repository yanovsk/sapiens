<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const allSmartCollections = ref([]);

async function getAllSmartCollections() {
  const smartcollections = await fetchy("/api/smartcollections/all", "GET", {});
  allSmartCollections.value = smartcollections;
  console.log(allSmartCollections.value);
}

onMounted(async () => {
  await getAllSmartCollections();
});
</script>

<template>
  <div>
    <h3>All Smart Collections</h3>
    <div class="smart-collection-container">
      <div v-for="collection in allSmartCollections" :key="collection._id" class="smart-collection-block">
        <h4>{{ collection.collectionTopic }}</h4>
        <p>Tags: {{ Array.isArray(collection.collectionTags) ? collection.collectionTags.join(", ") : "None" }}</p>

        <p>Number of Posts: {{ collection.containedPosts.length }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-collection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.smart-collection-block {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  width: calc(33.333% - 16px);
}
</style>

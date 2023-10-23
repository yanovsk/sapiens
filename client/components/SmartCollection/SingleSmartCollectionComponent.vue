<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import PostListComponent from "../Post/PostListComponent.vue";

interface SmartCollection {
  _id: string;
  collectionName: string;
  collectionTopic: string;
  collectionTags: string[] | null;
  containedPosts: string[];
  dateCreated: string;
  dateUpdated: string;
}

const smartColl = ref<SmartCollection | null>(null);
const smartCollPosts = ref<Array<Record<string, string>>>([]);
const route = useRoute();

async function getCollection() {
  const collectionname = Array.isArray(route.params.collectionname) ? route.params.collectionname[0] : route.params.collectionname;
  const smartCollection = await fetchy(`/api/smartcollection/${collectionname}`, "GET", {});
  smartColl.value = smartCollection.smartCollection;
  smartCollPosts.value = smartCollection.posts;
}

onMounted(async () => {
  await getCollection();
});

watch(
  () => route.params.collectionname,
  async () => {
    await getCollection();
  },
);
</script>

<template>
  <div class="smart-collection-container">
    <div v-if="smartColl" class="smart-collection-container">
      <h3>{{ smartColl.collectionTopic }}</h3>
      <p>Tags: {{ smartColl.collectionTags ? smartColl.collectionTags.join(", ") : "None" }}</p>
      <p>Date Created: {{ smartColl?.dateCreated.split("T")[0] }}</p>
      <p>Date Updated: {{ smartColl?.dateUpdated.split("T")[0] }}</p>
      <PostListComponent :posts="smartCollPosts" :canEdit="false" />
    </div>
  </div>
</template>

<style scoped>
.smart-collection-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 10px;
  color: #333;
}

p {
  margin-bottom: 5px;
  color: #555;
}
</style>

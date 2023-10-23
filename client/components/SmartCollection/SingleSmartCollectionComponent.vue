<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchy } from "../../utils/fetchy";
import PostListComponent from "../Post/PostListComponent.vue";

const smartColl = ref({});
const smartCollPosts = ref<Array<Record<string, string>>>([]);
const route = useRoute();

async function getCollection() {
  const collectionname = Array.isArray(route.params.collectionname) ? route.params.collectionname[0] : route.params.collectionname;
  const smartCollection = await fetchy(`/api/smartcollection/${collectionname}`, "GET", {});
  smartColl.value = smartCollection.smartCollection;
  smartCollPosts.value = smartCollection.posts;

  console.log("HO", smartColl.value, smartCollPosts.value);
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
  <div>
    <h3>Smart Collection</h3>
    <p>{{ smartColl }}</p>
    <p>{{ smartCollPosts }}</p>
    <PostListComponent :posts="smartCollPosts" :canEdit="false" />
  </div>
</template>

<style scoped></style>

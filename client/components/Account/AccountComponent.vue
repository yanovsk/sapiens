<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PostListComponent from "../Post/PostListComponent.vue";
import BioComponent from "./BioComponent.vue";

const userStore = useUserStore();

const { currentUsername } = storeToRefs(userStore);
const isMyAccount = ref(false);
const route = useRoute();

const checkUsername = () => {
  const routeUsername = Array.isArray(route.params.username) ? route.params.username[0] : route.params.username;
  isMyAccount.value = routeUsername === currentUsername.value;
};

const posts = ref<Array<{ _id: string }>>([]);

onBeforeMount(async () => {
  checkUsername();
  await loadPosts();
});

watch(
  () => route.params.username,
  async () => {
    checkUsername();
    await loadPosts();
  },
);

const loadPosts = async () => {
  let author = Array.isArray(route.params.username) ? route.params.username[0] : route.params.username;
  let query: Record<string, string> = author ? { author } : {};

  try {
    const postResults = await fetchy("/api/posts", "GET", { query });
    posts.value = postResults;
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div>
    <template v-if="isMyAccount">
      <BioComponent :username="currentUsername" />
      <br />
      <CreatePostForm @refreshPosts="loadPosts" />
      <br />
      <PostListComponent @refreshPosts="loadPosts" v-if="posts.length > 0" :posts="posts" :canEdit="isMyAccount" />
    </template>
    <template v-else>
      <BioComponent :username="Array.isArray(route.params.username) ? route.params.username[0] : route.params.username" />
      <br />
      <PostListComponent @refreshPosts="loadPosts" v-if="posts.length > 0" :posts="posts" :canEdit="isMyAccount" />
    </template>
  </div>
</template>

<style scoped></style>

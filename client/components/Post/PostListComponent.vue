<script setup lang="ts">
import { defineProps, ref } from "vue";

import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
const emit = defineEmits(["editPost", "refreshPosts"]);

const props = defineProps<{
  posts: Record<string, any>[];
  canEdit: boolean;
}>();

let editing = ref("");

function updateEditing(id: string) {
  editing.value = id;
}

function refreshPosts() {
  emit("refreshPosts");
}
</script>

<template>
  <section class="posts" v-if="props.posts && props.posts.length !== 0">
    <article v-for="post in props.posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @editPost="updateEditing" @refreshPosts="refreshPosts" />
      <EditPostForm v-else :post="post" @editPost="updateEditing" @refreshPosts="refreshPosts" />
      <br />
    </article>
  </section>
</template>

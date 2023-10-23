<script setup lang="ts">
import { defineProps, ref } from "vue";

import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";

const props = defineProps<{
  posts: Record<string, any>[];
  canEdit: boolean;
}>();

let editing = ref("");

function updateEditing(id: string) {
  editing.value = id;
}
</script>

<template>
  <div class="row">
    <h2>Posts:</h2>
  </div>

  <section class="posts" v-if="props.posts && props.posts.length !== 0">
    <article v-for="post in props.posts" :key="post._id">
      <PostComponent v-if="editing !== post._id" :post="post" @editPost="updateEditing" />
      <EditPostForm v-else :post="post" @editPost="updateEditing" />
    </article>
  </section>
  <p v-if="!posts || posts.length === 0">No posts found</p>
</template>

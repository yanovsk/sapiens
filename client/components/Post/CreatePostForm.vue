<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);
const isLoading = ref(false);

const placeholders = [
  "Share an academic discovery that fascinated you",
  "Explain a complex topic you understand well",
  "Pose a challenging question and your take on it",
  "Summarize a research paper you found insightful",
  "Describe an educational experience that changed your perspective",
];
const randomIndex = Math.floor(Math.random() * placeholders.length);
const selectedPlaceholder = ref("Write your new educational post here!  \n\n💡Random Idea: " + placeholders[randomIndex]);

const createPost = async (content: string) => {
  isLoading.value = true;
  try {
    await fetchy("/api/posts", "POST", {
      body: { content },
    });
  } catch (_) {
    isLoading.value = false;
    return;
  }
  isLoading.value = false;
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content)">
    <textarea id="content" v-model="content" :placeholder="selectedPlaceholder" required></textarea>
    <button v-if="!isLoading" type="submit" class="global-button-blue-border">Create Post</button>
    <div v-else class="pulsate">AI is analyzing your post...</div>
  </form>
  <hr />
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.global-button-blue {
  border: none;
  font-weight: 400;
}
textarea {
  font-family: inherit;
  border: 0.3px solid lightgray;

  font-size: 14px;
  height: 10em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
hr {
  width: 100%;
  border: 0.4px solid #ccc;
}

button {
  width: 25%;
  align-self: flex-end;
}
</style>

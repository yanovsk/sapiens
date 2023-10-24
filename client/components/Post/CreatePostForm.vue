<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);
const isLoading = ref(false);

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
    <textarea id="content" v-model="content" placeholder="Create a post!" required></textarea>
    <button v-if="!isLoading" type="submit" class="pure-button-primary pure-button">Create Post</button>
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

  font-size: inherit;
  height: 6em;
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

.pulsate {
  width: 25%;
  align-self: flex-end;
  animation: pulsate 1.5s infinite ease-in-out;
}

@keyframes pulsate {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>

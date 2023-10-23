<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { defineEmits, defineProps, onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = useUserStore();

const deletePost = async () => {
  await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  emit("refreshPosts");
};

const picLink = ref("");
const fullName = ref("");

onMounted(async () => {
  await getAuthorPic();
});

const getAuthorPic = async () => {
  const user = await fetchy(`/api/users/${props.post.author}`, "GET");
  picLink.value = user.picture;
  fullName.value = user.fullname;
};
</script>

<template>
  <div class="post-container">
    <div class="post-header">
      <router-link :to="`/account/${props.post.author}`">
        <img :src="picLink" alt="Profile Picture" class="profile-pic" />
      </router-link>
      <div class="post-info">
        <router-link :to="`/account/${props.post.author}`" class="name-link">{{ fullName }}</router-link>
        <p class="username">@{{ props.post.author }}</p>
        <p class="date">{{ formatDate(props.post.dateCreated) }}</p>
      </div>
    </div>
    <p class="post-content">{{ props.post.content }}</p>
    <hr class="divider" />
    <div class="post-tags">
      <span v-for="tag in props.post.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-container {
  border: 0.3px solid lightgray;
  background-color: white;
  padding: 16px;
  border-radius: 4px;
}

.post-header {
  display: flex;
}

.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}

.post-info {
  display: flex;
  flex-direction: column;
}

.name-link {
  font-weight: 600;
  text-decoration: none;
  color: black;
  line-height: 0.1;
  margin-bottom: 0;
  margin-top: 5px;
}

.username {
  font-weight: 400;
  line-height: 0.1;
  margin-bottom: 3px;

  color: gray;
}

.date {
  font-weight: 400;
  color: darkgray;
  font-size: 12px;
  margin-bottom: 0px;
}

.post-content {
  margin-top: 12px;
}

.divider {
  margin: 16px 0;
  color: lightgray;
}

.post-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background-color: #f2f2f2;
  padding: 3px 5px;
  border-radius: 12px;
  font-size: 12px;
}
</style>

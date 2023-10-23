<script setup lang="ts">
import { defineProps, onMounted, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps({ username: String });
const fullName = ref("");
const bio = ref("");
const picLink = ref("");
const followers = ref(0);
const following = ref(0);

async function getUserInfo() {
  try {
    const username = props.username;
    const fetchedInfo = await fetchy(`/api/users/${username}`, "GET", {});
    fullName.value = fetchedInfo.fullname;
    bio.value = fetchedInfo.bio;
    picLink.value = fetchedInfo.picture;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

async function getUserFollows() {
  try {
    const username = props.username;
    const uFollowing = await fetchy(`/api/following/${username}`, "GET", {});
    const uFollowers = await fetchy(`/api/followers/${username}`, "GET", {});
    console.log("FOLL", uFollowers, uFollowing);
    following.value = uFollowing.length;
    followers.value = uFollowers.length;
  } catch (error) {
    console.error("Error fetching user info: ", error);
  }
}

onMounted(async () => {
  await getUserInfo();
  await getUserFollows();
});

watch(
  () => props.username,
  async () => {
    await getUserInfo();
    await getUserFollows();
  },
);
</script>

<template>
  <div class="profile-container">
    <img :src="picLink" alt="Profile Picture" class="profile-pic" />
    <div class="profile-info">
      <h3 class="profile-name">{{ fullName }}</h3>
      <p class="profile-bio">{{ bio }}</p>
      <div class="profile-follow">
        <p class="follow-count">Followers: {{ followers }}</p>

        <p class="follow-count">Following: {{ following }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin: 15px;
}
.profile-follow {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #777;
  margin-top: 10px;
}

.follow-count {
  margin: 0;
  padding: 0;
}
.profile-pic {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
}

.profile-bio {
  font-size: 14px;
  color: #666;
}
</style>

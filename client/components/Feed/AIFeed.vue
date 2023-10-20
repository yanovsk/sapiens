<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const apiResponse = ref(); // State to hold API response data
const todaysPost = ref(""); // To store today's message

const getAIDailyPost = async () => {
  const response = await fetchy("/api/aiassistant", "GET");
  apiResponse.value = response.dailyPostsAndMsgs;

  const today = new Date().toISOString().split("T")[0];
  const todayData = apiResponse.value.find((item: any) => item.date.startsWith(today));

  if (todayData) {
    todaysPost.value = todayData.postContent;
  }
};

onMounted(async () => {
  await getAIDailyPost();
});
</script>

<template>
  <div>
    <div class="api-response">
      {{ todaysPost }}
    </div>
  </div>
</template>

<style>
.chat-box {
  max-height: 400px;
  overflow-y: auto;
}
.user {
  background-color: #e6e6e6;
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
}
.assistant {
  background-color: #f1f1f1;
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
}
</style>

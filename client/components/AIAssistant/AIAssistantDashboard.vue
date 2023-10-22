<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const apiResponse = ref(); // State to hold API response data
const todayMessage = ref(""); // To store today's message

const getAIAssistantDash = async () => {
  const response = await fetchy("/api/aiassistant", "GET");
  apiResponse.value = response.dailyPostsAndMsgs;

  const today = new Date().toISOString().split("T")[0];
  const todayData = apiResponse.value.find((item: any) => item.date.startsWith(today));

  if (todayData) {
    todayMessage.value = todayData.dailyMessage;
  }
};

onMounted(async () => {
  await getAIAssistantDash();
});
</script>

<template>
  <div>
    <div class="api-response">
      {{ todayMessage }}
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

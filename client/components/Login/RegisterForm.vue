<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { handleFileUpload } from "../../utils/handleFileUpload";

const picture = ref("");
const fileInput = ref(null);

const username = ref("");
const password = ref("");
const bio = ref("");
const fullname = ref("");
const { createUser, loginUser, updateSession } = useUserStore();

async function register() {
  const fileEvent = {
    target: fileInput.value,
  };
  const picUrl = await handleFileUpload(fileEvent as unknown as Event);
  if (picUrl) picture.value = picUrl;

  await createUser(username.value, fullname.value, bio.value, password.value, picture.value);
  await loginUser(username.value, password.value);
  await updateSession();
  void router.push({ name: "Feed" });
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
    <fieldset>
      <div class="form-container">
        <div class="pure-control-group">
          <input v-model.trim="fullname" type="text" id="aligned-name" placeholder="Full Name" required />
        </div>
        <div class="pure-control-group">
          <input v-model.trim="bio" type="text" id="aligned-bio" placeholder="Short Bio (up to 200 chars)" maxlength="200" required />
        </div>
        <div class="pure-control-group">
          <input v-model.trim="username" type="text" id="aligned-name" placeholder="Username" required />
        </div>
        <div class="pure-control-group">
          <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
        </div>
        <label for="fileInput">Upload Profile Picture:</label>
        <br />
        <br />

        <input type="file" ref="fileInput" id="fileInput" />
        <br />

        <div class="button-container">
          <button type="submit" class="login-button">Register</button>
        </div>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  width: 100%;
  background-color: #d9cafa;
  color: black;
  padding: 14px 20px;
  margin: 8px 0;
  border: 1px solid black;
  border-color: black;
  font-weight: 550;
  border-radius: 5px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #b69bee;
}
</style>

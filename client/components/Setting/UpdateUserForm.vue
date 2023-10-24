<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { validateInput, validateName } from "@/utils/validators";
import { ref } from "vue";

import { handleFileUpload } from "../../utils/handleFileUpload";
const picture = ref("");
const fileInput = ref(null);
const username = ref("");
const password = ref("");
const fullname = ref("");
const errorMessage = ref("");
const bio = ref("");
const { updateUser, updateSession } = useUserStore();

function performValidation(inputText: string, field: string) {
  let isValid = false;
  let message = "";

  switch (field) {
    case "Full name":
      ({ isValid, message } = validateName(inputText));
      break;
    default:
      ({ isValid, message } = validateInput(inputText));
      break;
  }

  if (!isValid) {
    errorMessage.value = `${field}: ${message}`;
  }

  return isValid;
}

async function updateName() {
  if (performValidation(fullname.value, "Full name")) {
    await updateUser({ fullname: fullname.value });
    await updateSession();
    fullname.value = "";
  }
}

async function updateUsername() {
  await updateUser({ username: username.value });
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUser({ password: password.value });
  await updateSession();
  password.value = "";
}

async function updateBio() {
  if (performValidation(bio.value, "Bio")) {
    await updateUser({ bio: bio.value });
    await updateSession();
    bio.value = "";
  }
}

async function updatePicture() {
  const fileEvent = {
    target: fileInput.value,
  };

  const picUrl = await handleFileUpload(fileEvent as unknown as Event);
  if (picUrl) picture.value = picUrl;

  await updateUser({ picture: picture.value });
  await updateSession();
}
</script>

<template>
  <h2>Update account details</h2>
  <span>{{ errorMessage }}</span>
  <form @submit.prevent="updateName" class="pure-form">
    <fieldset>
      <legend>Change your name</legend>
      <div class="field">
        <input type="text" placeholder="New name" v-model="fullname" required />
        <button v-if="fullname" type="submit" class="btn-small global-button-blue">Update Name</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <div class="field">
        <input type="text" placeholder="New username" v-model="username" required />
        <button v-if="username" type="submit" class="btn-small global-button-blue">Update username</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updateBio" class="pure-form">
    <fieldset>
      <legend>Update your bio</legend>
      <div class="field">
        <textarea placeholder="Updated Bio" v-model="bio" required></textarea>

        <button v-if="bio" type="submit" class="btn-small global-button-blue">Update bio</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updatePicture" class="pure-form">
    <fieldset>
      <legend>Update your picture</legend>
      <div class="field">
        <input type="file" ref="fileInput" required />
        <button type="submit" class="btn-small global-button-blue">Update Picture</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <div class="field">
        <input type="password" placeholder="New password" v-model="password" required />
        <button v-if="password" type="submit" class="btn-small global-button-blue">Update password</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>

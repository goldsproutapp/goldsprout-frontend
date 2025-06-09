<script setup lang="ts">
import { parseFile } from '@/lib/processing/snapshot_import';
import type { Account } from '@/lib/types';
import { isArray } from '@/lib/utils';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    account: Account | undefined;
    forbidCopyPrevious?: boolean;
    forbidCreateEmpty?: boolean;
    extended?: boolean;
  }>(),
  {
    forbidCopyPrevious: false,
    forbidCreateEmpty: false,
    extended: false
  }
);
const emit = defineEmits<{
  (e: 'fileUpload'): void;
  (e: 'copyPrevious'): void;
  (e: 'selectEmpty'): void;
  (e: 'error', errors: string[]): void;
}>();

const dataValid = defineModel<boolean>('dataValid');
const data = defineModel<any[]>('data');

const csvText = ref('');
const invalidDataText = computed(() => !(csvText.value == '' || dataValid.value));

const fileUpload = async (event: FileUploadUploaderEvent) => {
  // @ts-ignore
  const file = event.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    // @ts-ignore
    const text: string = e.target.result;
    const [success, parsed] = parseFile(text.split('\n'), [], props.extended);
    if (success) {
      data.value = parsed;
      emit('fileUpload');
    } else {
      if (isArray<string>(parsed)) emit('error', parsed);
    }
  };
  reader.readAsText(file);
};

const csvTextUpdated = () => {
  const fallbackFmt = props.account?.provider?.csv_format_obj;
  const [success, parsed] = parseFile(
    csvText.value.split('\n'),
    fallbackFmt ? [fallbackFmt] : [],
    props.extended
  );
  if (success) {
    data.value = parsed;
    dataValid.value = true;
  } else {
    data.value = [];
    dataValid.value = false;
  }
};
</script>

<template>
  <div class="upload-container">
    <span class="input-instruction">Upload file</span>
    <FileUpload
      accept="text/csv"
      :show-upload-button="false"
      :show-cancel-button="false"
      custom-upload
      auto
      @uploader="fileUpload"
    >
      <template #content><div class="file-upload-target">Drag and drop file.</div></template>
    </FileUpload>
    <Divider>Or</Divider>
    <span class="input-instruction">Enter text</span>
    <Textarea v-model="csvText" @input="csvTextUpdated" :invalid="invalidDataText" />
    <template v-if="!forbidCopyPrevious">
      <Divider>Or</Divider>
      <Button
        :disabled="forbidCopyPrevious"
        label="Copy previous"
        outlined
        severity="secondary"
        @click="$emit('copyPrevious')"
      />
    </template>
    <template v-if="!forbidCreateEmpty">
      <Divider>Or</Divider>
      <Button label="Empty snapshot" outlined severity="secondary" @click="$emit('selectEmpty')" />
    </template>
  </div>
</template>

<style scoped>
.input-instruction {
  margin-bottom: var(--inline-spacing);
}
.file-upload-target {
  text-align: center;
  margin: 1rem;
}
.upload-container {
  display: flex;
  flex-direction: column;
}
</style>

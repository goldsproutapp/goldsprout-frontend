import { computed, ref, watch, type Ref } from 'vue';
import { DEFAULT_IMPORT_FORMAT } from '../constants';
import { authenticatedRequest } from '../requests';
import { preferenceState } from '../state';
import type { ComputedRef } from 'vue';
import { deepEqual } from '../utils';

export const PRESET_DEFAULT_LABEL = 'Default';

export interface PresetServiceOptions {
  onChange: () => void;
}
const defaultPersistenceOptions: PresetServiceOptions = {
  onChange: () => {}
};

export class PresetService<T extends {}> {
  private options: PresetServiceOptions;
  private bucket: string;
  loading: Ref<boolean>;
  processing: Ref<boolean>;
  optionLabels: Ref<string[]>;
  selectedKey: Ref<string>;
  selectedData: Ref<T>;
  factory: () => T;
  canSave: ComputedRef<boolean>;
  private default_template: T;
  defaultIsCustom: ComputedRef<boolean>;

  constructor(bucket: string, factory: () => T, opts: PresetServiceOptions) {
    this.bucket = bucket;
    this.factory = factory;
    this.default_template = this.factory();
    this.options = opts;
    this.loading = ref(true);
    this.processing = ref(false);
    this.optionLabels = ref([]);
    this.selectedKey = ref(PRESET_DEFAULT_LABEL);
    this.selectedData = ref(this.factory()) as Ref<T>;
    this.defaultIsCustom = computed(
      () =>
        Object.keys(preferenceState.presets).includes(this.bucket) &&
        Object.keys(preferenceState.presets[this.bucket]).includes(DEFAULT_IMPORT_FORMAT) &&
        !deepEqual(
          preferenceState.presets[this.bucket][DEFAULT_IMPORT_FORMAT],
          this.default_template
        )
    );
    this.canSave = computed(
      () =>
        !this.loading.value &&
        !(this.selectedKey.value == PRESET_DEFAULT_LABEL && this.defaultIsCustom.value) &&
        (!this.optionLabels.value.includes(this.selectedKey.value) ||
          !deepEqual(
            this.selectedData.value,
            preferenceState.presets[this.bucket][this.selectedKey.value]
          ))
    );
    this.fetchData();
    watch(this.selectedKey, () => this.selectionChanged());
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  selectionChanged() {
    const opts = preferenceState.presets[this.bucket];
    if (Object.keys(opts).includes(this.selectedKey.value)) {
      this.selectedData.value = this.deepCopy(opts[this.selectedKey.value]) as T;
      this.options.onChange();
    } else if (this.selectedKey.value == PRESET_DEFAULT_LABEL) {
      this.selectedData.value = this.factory();
      this.options.onChange();
    }
  }

  async deleteOption(key: string) {
    delete preferenceState.presets[this.bucket][key];
    this.saveRequest();
  }

  private async saveRequest() {
    await authenticatedRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferenceState)
    });
    await this.fetchData();
  }

  async save() {
    this.processing.value = true;
    preferenceState.presets[this.bucket][this.selectedKey.value] = this.deepCopy(
      this.selectedData.value
    );
    await this.saveRequest();
    setTimeout(() => (this.processing.value = false), 500);
  }

  private async fetchData() {
    const res = await authenticatedRequest('/preferences');
    const { data } = await res.json();
    const { presets = {} } = data;
    if (!Object.keys(presets).includes(this.bucket)) presets[this.bucket] = {};
    preferenceState.presets = presets;
    const keys = Object.keys(presets[this.bucket]);
    if (!keys.includes(PRESET_DEFAULT_LABEL)) keys.push(PRESET_DEFAULT_LABEL);
    else {
      this.selectedData.value = preferenceState.presets[this.bucket][PRESET_DEFAULT_LABEL] as T;
      this.options.onChange();
    }
    this.optionLabels.value = keys;
    this.loading.value = false;
  }
}

export function usePresets<T extends {}>(
  bucket: string,
  factory: () => T,
  opts: Partial<PresetServiceOptions> = {}
): PresetService<T> {
  const options: PresetServiceOptions = Object.assign(defaultPersistenceOptions, opts);
  return new PresetService<T>(bucket, factory, options);
}

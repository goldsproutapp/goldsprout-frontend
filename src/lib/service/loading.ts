import type { Ref } from 'vue';
import { ref } from 'vue';
import { MIN_LOADING_TIME_MS } from '../constants';

/**
 * Enforce a minimum loading time of MIN_LOADING_TIME_MS (or other) to permit showing a
 * progress indicator which cannot reasonably be displayed for very short periods.
 */
export class MinimumLoadingHandler {
  min_time: number;
  private _loading: Ref<boolean>;
  private started_at: number;
  constructor(min_time: number) {
    this.min_time = min_time;
    this._loading = ref(false);
    this.started_at = 0;
  }

  enter() {
    this._loading.value = true;
    this.started_at = Date.now();
  }
  exit(cb: () => void) {
    if (this.started_at == 0) cb();
    else
      setTimeout(
        () => {
          this._loading.value = false;
          cb();
        },
        -Math.min(Date.now() - this.started_at - this.min_time, 0)
      );
  }
  get loading(): boolean {
    return this._loading.value;
  }
}

export function useMinimumLoading(min_time = MIN_LOADING_TIME_MS): MinimumLoadingHandler {
  return new MinimumLoadingHandler(min_time);
}

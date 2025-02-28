import { authState } from './state';

export async function downloadFile(res: Response) {
  const blob = await res.blob();
  // TODO: this probably isn't spec-compliant
  const filename = res.headers.get('Content-Disposition')?.split('filename=')[1] ?? 'download.txt';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function hasWritePermFor(forUserID: number): boolean {
  const user = authState.userInfo;
  if (user.is_admin) return true;
  if (user.access_permissions.some((perm) => perm.access_for_id == forUserID && perm.write))
    return true;
  return false;
}

export function minmaxIgnoreOutliers(nums: number[], op: 'min' | 'max'): number {
  if (nums.length == 0) return Infinity * (op == 'max' ? 1 : -1); // behaviour of Math[max|min]
  const isMax = op == 'max';
  const sorted = nums.sort((a, b) => a - b);

  const iq = sorted.filter((_, i) => i > sorted.length / 4 && i < (3 * sorted.length) / 4);
  const q1 = iq[0];
  const q3 = iq[iq.length - 1];
  const iqr = q3 - q1;
  const outlierBoundary = 1.5;
  const upperBoundary = q3 + iqr * outlierBoundary;
  const lowerBoundary = q1 - iqr * outlierBoundary;

  let max: number;
  do {
    max = Math[op](...nums);
    nums.splice(nums.indexOf(max), 1);
  } while (isMax ? max > upperBoundary : max < lowerBoundary);
  return max;
}

export function isArray<T>(arr: any): arr is T[] {
  return Array.isArray(arr);
}

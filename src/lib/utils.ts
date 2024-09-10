import { authState } from './state';
import type { User } from './types';

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

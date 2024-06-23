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

export async function fetchAsString(url: string): Promise<string> {
  return (await fetch(url)).text();
}

/** Task display serials — `<KEY>-NN`. The active project key is module-level
 *  (set by AppProvider in an effect) so plain helpers and toasts can build
 *  serials without hook plumbing. */
let activeProjectKey = "ATL";

export const setActiveProjectKey = (key: string) => {
  activeProjectKey = key;
};

export const projKey = () => activeProjectKey;

export function taskSerial(id: number | string): string {
  return `${activeProjectKey}-${id}`;
}

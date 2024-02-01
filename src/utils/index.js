export function loadScript(attrs = {}) {
  const src = typeof attrs === 'string' ? attrs : attrs?.src;
  if (!src) {
    throw new Error('No script source provided');
  }
  const script = document.createElement('script');
  if (typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, value]) => {
      if (!key) return;
      script.setAttribute(key, value);
      if (!value) {
        script.removeAttribute(key);
        script.key = value;
      }
    });
  }
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
  if (attrs.callback || attrs.onload || attrs.onerror) {
    script.onload = attrs.onload || attrs.callback;
    script.onerror = attrs.onerror || attrs.callback;
    return script;
  }
  return new Promise((resolve, reject) => {
    script.onload = () => {
      resolve(script);
    };
    script.onerror = () => {
      reject(new Error(`Script load error for ${attrs.src}`));
    };
  });
}

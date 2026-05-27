self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type === 'compressReplay') {
    const raw = JSON.stringify(payload);
    self.postMessage({ type: 'compressedReplay', payload: { length: raw.length, checksum: payload.checksum } });
  }
};

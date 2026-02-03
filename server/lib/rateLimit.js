function withinRate(bucketMap, id, limit, windowMs) {
  const now = Date.now();
  const bucket = bucketMap.get(id) || { windowStart: now, count: 0 };
  if (now - bucket.windowStart > windowMs) {
    bucket.windowStart = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  bucketMap.set(id, bucket);
  return bucket.count <= limit;
}

export { withinRate };

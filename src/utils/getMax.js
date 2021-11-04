function getMax(arr) {
  let len = arr.length - 1;
  let max = -Infinity;

  while (len) {
    max = arr[len] > max ? arr[len] : max;
    len -= 1;
  }
  return max;
}

module.exports = getMax;

/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const unwrapESModule = function (code) {
  if (code.__esModule != null && code.__esModule) {
    return code.default
  }
  return code
}

export { unwrapESModule }

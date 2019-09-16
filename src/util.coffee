unwrapESModule = (code)->
  if code.__esModule? and code.__esModule
    return code.default
  return code

export {unwrapESModule}

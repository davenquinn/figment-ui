import {assertPropTypes} from 'check-prop-types'

assertShape = (data, shape, subject="data", object="application")->
  res = assertPropTypes({v: shape.isRequired}, {v: data}, subject, object)
  throw res if res?

export {assertShape}

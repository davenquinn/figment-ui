import T from 'prop-types'
import {assertPropTypes} from 'check-prop-types'

assertShape = (data, shape, subject="data", object="application")->
  res = assertPropTypes({v: shape.isRequired}, {v: data}, subject, object)
  throw res if res?

MarginType = T.oneOfType [T.string, T.number]

export {assertShape, MarginType}

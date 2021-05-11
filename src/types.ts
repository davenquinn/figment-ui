import T from "prop-types"
import { assertPropTypes } from "check-prop-types"

const assertShape = function (
  data,
  shape,
  subject = "data",
  object = "application"
) {
  const res = assertPropTypes(
    { v: shape.isRequired },
    { v: data },
    subject,
    object
  )
  if (res != null) {
    throw res
  }
}

const MarginType = T.oneOfType([T.string, T.number])

export { assertShape, MarginType }

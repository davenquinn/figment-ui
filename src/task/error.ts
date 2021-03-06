import h from "~/hyper"
import { Callout, Intent } from "@blueprintjs/core"

const ErrorLines = function (p) {
  const renderEnd =
    p.last_line !== p.first_line || p.last_column !== p.first_column
  return h("span.lines", [
    h("span.start", `${p.first_line + 1}:${p.first_column + 1}`),
    h.if(renderEnd)([
      "-",
      h("span.end", `${p.last_line + 1}:${p.last_column + 1}`),
    ]),
  ])
}

const ErrorLocation = function (props) {
  const { fileName, location } = props

  return h("h5.location.bp3-heading", [
    h("span.filename", fileName),
    " ",
    h(ErrorLines, location),
  ])
}

const ErrorTitle = function (props) {
  const { error } = props
  if (typeof error === "string") {
    return h("span", error)
  }
  return h([h("span", error.name), ": ", h("em.message", error.message)])
}

const Error = function (props) {
  const { error, origin, details } = props
  const { fileName, location } = error

  const componentStack = details?.componentStack

  return h(
    Callout,
    {
      className: "error",
      intent: Intent.DANGER,
      icon: "error",
      title: h(ErrorTitle, { error }),
    },
    [
      h.if(fileName != null)(ErrorLocation, { fileName, location }),
      h.if(error.stack != null)("pre.stack.bp3-code-block", error.stack),
      h.if(origin != null)("h6.bp3-text.origin", error.origin),
      h.if(error.code != null)("details", [
        h("summary", "Code"),
        h("pre.code.bp3-code-block", error.code),
      ]),
      h.if(componentStack != null)("details", [
        h("summary", "Component stack"),
        h("pre.stack.bp3-code-block", componentStack),
      ]),
    ]
  )
}

const BundlerError = (props) =>
  h("div.error-overlay", [h(Error, { origin: "Bundler", ...props })])

export { BundlerError }

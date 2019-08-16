import { Position, Toaster } from "@blueprintjs/core"
import styles from "./main.styl"

AppToaster = Toaster.create {
  className: styles['toaster']
  position: Position.TopRight
}

export {AppToaster}

import { Position, Toaster } from "@blueprintjs/core";
import styles from "./main.styl";

const AppToaster = Toaster.create({position: Position.TOP, className: styles['app-toaster']});

export {AppToaster};

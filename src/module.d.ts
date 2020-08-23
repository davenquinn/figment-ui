declare interface TaskOptions {
  pageSize?: any
  width?: number
  height?: number
  dpi?: number
  rasterize?: boolean
}

declare interface Task {
  opts?: TaskOptions
}

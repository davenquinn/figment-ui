# pdf-printer

A package for building static data visualizations and
printing them to PDF files.

This package is similar in many respects to
s[electron-pdf](https://github.com/fraserxu/electron-pdf),
but works at a higher level, and for a more specific purpose.
It is designed to make the
DOM, its SVG extensions, and the universe of awesome
tools that have been designed for it (e.g. `d3`),
a first-class graphics environment for creating high
quality static figures.

## CLI usage

A simple UNIXy CLI is available by default:

```
> pdf-printer [opts] [--] <script> <out.pdf>
```

The `<script>` argument is a Javascript (or coffeescript)
file that exports a function
that takes arguments `el` and `callback`, e.g.

```js
import d3 from "d3"

export function createFigure(el, cb){
  d3.select(el)
    .append("div")
    .text("Significant results detected");
  cb();
}
```

### Options

`--debug`: Show a debug mode in which files are reloaded
on change from the root directory. This can be used to
make changes to figure code and settings in advance of printing.

`--show`: Show figures before printing (wait for user input
before proceeding.

`--reload <dir>`: Set a directory to reload from (for testing)

`--spec-mode`: Reload from a specification file (using the
API below) instead of file parameters at the CLI. The
calling signature then becomes `pdf-printer --spec-mode -- <specfile>`.

## Compile-time helpers

Compile-time helpers can be specified to load, e.g., css
or stylesheets to be passed through preprocessors. Direct
loading with require hooks is emphasized to make things
easier.

Several hooks come prepackaged, but you can add your own
by passing a function to the list of `helpers` options.

### Prepackaged hooks

Hooks for `stylus-css-modules` (both global- and local-by-default)
are included as is a helper for bare `stylus` and `css`.

## API

```coffeescript
p = Printer
  helpers: [
    'stylus-css-modules-global' # The current default
    require 'handlebars-require-hook' # a random function
  ]

p.task 'test.pdf', './test-figure'
p.task 'test2.pdf', (el,callback)->
  d3.select el
    .append 'text'
    .text 'This is a basic figure'
  callback()
```

## TODO

- Support more formats
- Create a dependency on `electron-pdf`?
- Make helpers definable in CLI
- Remove `coffeescript` and `stylus` defaults
- Allow testing on multiple figures at once



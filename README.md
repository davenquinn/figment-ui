# pdf-printer

A package for building static data visualizations and
printing them to PDF files. It is designed to make the
DOM, its SVG extensions, and the universe of awesome
tools that have been designed for it (e.g. `d3`) a first-class graphics environment for creating high
quali

## Debug mode

## Compile-time helpers

Compile-time helpers can be specified to load, e.g., css
or stylesheets to be passed through preprocessors. Direct
loading with require hooks is emphasized to make things
easier.

Several hooks come prepackaged, but you can add your own
by passing a function to the list of `helpers` options.

#### Prepackaged hooks

#### API

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

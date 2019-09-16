# Figment UI

**Figment** renders static figures and graphics to PDF
using Javascript and the web
visualization pipeline.
It is intended to support the iterative and reproducible production of graphics using cutting-edge web tooling.
It was originally created to produce beautiful and
data-dense scientific figures.

**Figment** seamlessly bundles code to Javascript,
renders a SVG or HTML document, and prints the output to a PDF. It combines the code-generation and
iterative development capabilities of Javascript bundlers such as
[Parcel](https://parceljs.org) and
[Webpack](https://webpack.js.org) with the
rendering capabilities of [Electron](https://electronjs.org) static-PDF rendering  capabilities
of  rendering engines such as
[electron-pdf](https://github.com/fraserxu/electron-pdf),
The Since the entire stack
runs on [Electron](https://electronjs.org), it can be


## Motivation

In the 2010s, the web has increasingly become the medium
of choice for the graphical communication of data.
Innovations by many workers have advanced the technical capabilities
of the browser for displaying complex, interactive data. Beautiful
and informative
interactive graphics have graced mainstream publications
such as the New York Times. Web maps have replaced paper maps.

This revolution in the visual language of the internet has been
enabled by the cutting-edge and standardized Javascript/HTML/SVG
rendering engine of modern browsers, along with innovative libraries
such as [D3](https://d3js.org).
As the web's technical stack has matured,
more traditional tools for data visualization
have stagnated somewhat: for instance, the venerable
*Adobe Illustrator* provides basically no capabilities for
data-driven or programmatically-generated graphics. Meanwhile,
software toolkits commonly used for data analysis (e.g.
Matlab, Python's Matplotlib, and R) excel at generating basic
graphs and maps, but have few tools for complex or customized
visualizations.

Static graphics are still essential.
For instance, scientific papers and presentations still revolve
around information-dense static figures; these formats for technical
communication are both extremely important and slow to evolve.
Rather than stick to an older paradigm of manual tooling for static
graphics production, we'd like to harness the new technologies
developed for the web.

Unfortunately, this process is less friendly than we'd like it to be. The core client-server architecture of the web platform
requires a complex toolchain to actually render a graphic to a browser.
The rapid evolution of the pipeline has led to a profusion of shims
to support new capabilities.
**Figment** attempts to manage or work around some of the major
sticking points, easing the production of complex visualizations
using Javascript.

## How it works

Typically, building a web visualization requires data to be
packaged on a server into a *serializable* format (e.g. JSON)
and exposed on the web as a file or API. Then, Javascript is run in
the client's browser to download this data and transform it into a
HTML or SVG representation.

Using the [Electron](https://electronjs.org) rendering engine, **Figment** ditches the client/server model entirely allows you to build web visualizations *locally*.
Although visualization code runs in the browser environment, it is
executed *on your local system*, with the full power and system access of [NodeJS](https://nodejs.org).
Thus, visualizations can rely on local resources
such as modeling pipelines, database connections, and files that are not exposed via an HTTP API for typical browser use.

Another key capability of **Figment** is transforming code. The code
that underlies web tools is packaged into functional units tools are built with code that is packaged by component and function; the constituent parts must be bundled together into a
coehernt package. This is a particular problem for libraries such
as [React](https://reactjs.org), which often assume the use of Javascript extensions such as [JSX](https://facebook.github.io/jsx/).
**Figment** includes the [Parcel](https://parceljs.org) Javascript bundler, allowing a wide variety of file types to be incorporated
into figure generation.
[Webpack](https://webpack.js.org).


The basic form of **Figment** arose in ~2015, out of a desire to use [D3](https://d3js.org) to produce scientific figures. Initially referred to as "PDF Printer", this package did two things




and reproducibly generate static graphics. The code-bundling and PDF-generation
features are designed for smooth creation of data-rich scientific figures
using Webkit's powerful DOM and SVG-generation ability.
Ultimately, make building complex figures in Javascript


but works at a higher level, and strives purpose.
It is designed to make the
DOM, its SVG extensions, and the universe of awesome
tools that have been designed for it (e.g. `d3`),
a first-class graphics environment for creating high
quality static figures.

## Workflow

![PDF Printer debug mode](pdf-printer-debug-mode.png)

- Make a figure!
  - Use HTML/Javascript/SVG/CSS (and preprocessors if needed)
  - Call system APIs, run SQL locally, etc.
- Debug or fiddle with your creation in debug mode
  (pictured above).
  - `pdf-printer --debug empty-file.js`
  - This could be a good opportunity to
    add annotations with [d3-annotation](https://github.com/susielu/d3-annotation).
- Print programmatically from the command line!

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

## Development

- `/main` directory contains main process Javascript
- `/src` directory contains renderer process Javascript/Coffeescript
  (compiled with Parcel).

Compilation can be run with `npm start`.

## TODO

- [ ] Support non-Javascript **Parcel** entrypoints
- [-] Support more formats. *png and jpeg support are half-baked but important*
- Create a dependency on `electron-pdf`?
- Make helpers definable in CLI
- Remove `coffeescript` and `stylus` defaults
- Allow testing on multiple figures at once

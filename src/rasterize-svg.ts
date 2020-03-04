/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {select} from 'd3-selection';

const rasterizeSVG = async (node: HTMLElement, opts={})=>{
  /*
   * Replaces an SVG group with an SVG image
   * Cuts file sizes and abstracts away bugs
   * with Chrome printing of SVG subtleties
   */
  const ratio = opts.ratio ?? 4.167; // Web -> 300 dpi print
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const {width, height} = node.getBoundingClientRect();
  const newSize = {width: width*ratio, height: height*ratio};

  canvas.height = newSize.height;
  canvas.width = newSize.width;

  const doctype = `<?xml version="1.0" standalone="no"?> \
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;

  // serialize our SVG XML to a string.
  const source = (new XMLSerializer()).serializeToString(node);


  // create a file blob of our SVG.
  const blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  
  return await new Promise((resolve, reject)=>{
    img.onload = function() {
      try {
        ctx.drawImage(img, 0, 0, width, height, 0,0, newSize.width, newSize.height);
        console.log(width, height, newSize)
        URL.revokeObjectURL(url);
        const href = canvas.toDataURL("image/png");
        //document.removeChild(canvas);
        const newSVG = node.cloneNode();
        select(newSVG)
          .append('image')
            .attr('width', width)
            .attr('height', height)
            .attr('href', href);
        node.replaceWith(newSVG);
        resolve()
      } catch (err) {
        reject(err)
      }
    };
    img.src = url;
    // Replace the DOM element
  })
};

export {rasterizeSVG};

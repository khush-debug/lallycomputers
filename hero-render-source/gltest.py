import asyncio, time, json
from playwright.async_api import async_playwright
HTML = """<html><body><canvas id=c width=1920 height=1080></canvas></body></html>"""
JS = r"""
() => {
  const c = document.getElementById('c');
  const gl = c.getContext('webgl2', {antialias:false, preserveDrawingBuffer:true});
  if(!gl) return {ok:false};
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const out = {ok:true, renderer: info? gl.getParameter(info.UNMASKED_RENDERER_WEBGL):'?', maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE),
     cbf: !!gl.getExtension('EXT_color_buffer_float'), chf: !!gl.getExtension('EXT_color_buffer_half_float'), flin: !!gl.getExtension('OES_texture_float_linear')};
  const vs = `#version 300 es
  void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.-1.,0,1);} `;
  const fs = `#version 300 es
  precision highp float; out vec4 o; uniform float t;
  float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  void main(){ vec2 uv = gl_FragCoord.xy/vec2(1920.,1080.); float a=0.; 
    for(int i=0;i<64;i++){ a += h(uv*float(i+1)+t)*0.01; }
    o = vec4(vec3(a),1.); }`;
  const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh); if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(sh); return sh;};
  const p = gl.createProgram(); gl.attachShader(p,mk(gl.VERTEX_SHADER,vs)); gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p); gl.useProgram(p);
  const px = new Uint8Array(4);
  const t0 = performance.now();
  for(let i=0;i<5;i++){ gl.uniform1f(gl.getUniformLocation(p,'t'), i); gl.drawArrays(gl.TRIANGLES,0,3); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); }
  out.msPerFrame64hash = (performance.now()-t0)/5;
  return out;
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--enable-webgl'])
        pg = await b.new_page(viewport={'width':1920,'height':1080})
        await pg.set_content(HTML)
        print(json.dumps(await pg.evaluate(JS), indent=1))
        await b.close()
asyncio.run(main())

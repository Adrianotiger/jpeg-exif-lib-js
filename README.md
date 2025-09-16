# JPEG EXIF Lib Javascript

A Javascript library, to parse and edit the EXIF attribute on the fly over a webpage.

```javascript
// image can be an arrabuffer, a base64 string, a File or a link
let jpg = new JPG(image);
jpg.open().then(()=>{
  jpg.setExif(JPGCONST.EXIF.SOFTWARE, "GitHub Editor");
  let newBinaryFile = jpg.getBuffer();
});
```

<img src="images/exif_binary.png" style="height:20vh">

Please check the examples and tools directly on the webpage:  
<a href="https://adrianotiger.github.io/jpeg-exif-lib-js/">https://adrianotiger.github.io/jpeg-exif-lib-js/</a>

function _CN(e,t,r,n=null){var o=document.createElement(e);if("object"==typeof t)for(var a in t)o.setAttribute(a,t[a]);return Array.isArray(r)&&r.forEach(e=>{o.appendChild("string"==typeof e||"number"==typeof e?document.createTextNode(e):e)}),null!==n&&n.appendChild(o),o}

let JpegTools = new class
{
    constructor()
    {

    }

    generateExifList(jpeg, options)
    {
        let list = [];

        // jpeg.subsections[0] = header
        if(!jpeg || !jpeg.subsections || !jpeg.subsections[0] || !jpeg.subsections[0] || !jpeg.subsections[0].subsections) return list;

        const app1 = jpeg.subsections[0].subsections[1];
        if(!app1 || app1.name.localeCompare("app1") !== 0 || !app1.subsections) return list;

        Object.keys(app1.subsections).forEach(sk=>{
            //if(app1.subsections[sk].name.localeCompare("ifd0") === 0)
            {
                const ifdx = app1.subsections[sk];
                Object.keys(ifdx.subsections).forEach(ifdk=>{
                    const ifdTag = ifdx.subsections[ifdk];
                    list.push({
                        key: ifdTag.name,
                        value: ifdTag.toString(),
                        description: JPGCONST['EXIF_' + ifdTag.Tag.toString(16)]?.Description + " [tag:0x" + ifdTag.Tag.toString(16).padStart(4,"0") + "]"
                    });
                });
            }
        });
        
        return list;
    }

    addContextToImages()
    {
        let imgs = document.body.getElementsByTagName("img");
        [...imgs].forEach(img=>{
            if(typeof img.oncontextmenu == "function") return;

            img.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                const left = Math.min(e.clientX-10, window.innerWidth - 260);
                const top = Math.min(e.clientY-10, window.innerHeight - 500);
                const div = _CN("div", {style:`position:absolute;width:250px;max-width:250px;min-height:50px;max-height:50vh;overflow-y:auto;left:${left}px;top:${top}px;background-color:#aaa;border-radius:5px;box-shadow:inset 2px 2px #ddf, inset -2px -2px #669, 0px 0px 0px 1px #fff;font-family:monospace;font-size:10px;line-height:11px;padding:10px 5px;`}, [], document.body);
                div.addEventListener("mouseleave", ()=>{
                    document.body.removeChild(div);
                });
                _CN("span", {style:"position:absolute;right:4px;top:4px;height:20px;width:20px;background-color:#844;color:#fff;font-size:16px;line-height:20px;text-align:center;border-radius:5px;cursor:pointer;"}, ["X"], div).addEventListener("click", ()=>{
                    document.body.removeChild(div);
                });
                let i = _CN("i", {}, ["Loading..."], div);
                
                let jpeg = new JPG(img.src);
                jpeg.open().then(()=>{
                    let list = JpegTools.generateExifList(jpeg, {});
                    div.removeChild(i);
                    if(list.length == 0)
                    {
                        _CN("i", {}, ["No EXIF info"], div);
                    }
                    else
                    {
                        const table = _CN("table", {style:"width:90%;max-width:230px;margin:0 auto;text-align:left;line-break:anywhere;table-layout:fixed;"}, [], div);
                        list.forEach(l=>{
                            _CN("tr", {title:l.description}, [
                                _CN("th", {}, [l.key.substring(0, l.key.indexOf("(")>0?l.key.indexOf("("):100)]),
                                _CN("td", {}, [l.value])
                            ], table);
                        });
                    }
                    console.log(list);
                }).catch(e=>{
                    div.removeChild(i);
                    _CN("i", {}, ["Not a JPEG image"], div);
                });
            });
        });
    }

    catchConsoleErrors()
    {
        const logDiv = _CN("div", {style:`position:absolute;width:250px;max-width:350px;min-height:50px;max-height:20vh;overflow-y:scroll;right:10px;bottom:10px;background-color:#333;border-radius:5px;box-shadow:inset 2px 2px #888, inset -2px -2px #444, 0px 0px 0px 1px #800;font-family:sans-serif;font-size:10px;line-height:11px;padding:10px 5px;display:none;transition:all 0.5s;scrollbar-color: #d40 transparent;text-align:left;`}, [], document.body);
        const originalWarn = console.warn;
        const originalError = console.error;
        _CN("span", {style:"position:absolute;right:0px;top:4px;height:20px;width:20px;background-color:#844;color:#fff;font-size:16px;line-height:20px;text-align:center;border-radius:5px;cursor:pointer;opacity:0.5;"}, ["X"], logDiv).addEventListener("click", ()=>{
            logDiv.style.opacity = 0.0;
            setTimeout(()=>{
                logDiv.style.display = "none";
            }, 500);
        });

        const showMsg = ()=>{
            logDiv.scrollTo(0, logDiv.scrollHeight);
            if(logDiv.style.opacity > 0.9) return;
            logDiv.style.display = "block";
            logDiv.style.opacity = 1.0;
        };

        console.warn = function (...args) {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(" ");
            const stack = new Error().stack;
            if(stack.startsWith("Error") && stack.split("\n").length > 2 && stack.split("\n")[2].indexOf("/lib/jpg/") > 0 && stack.split("\n")[2].split(":").length > 2)
            {
                //https://github.com/Adrianotiger/jpeg-exif-lib-js/blob/main/lib/jpg/jpgconst.js#L14
                //at JPGApp1IFD.setExif (https://cuddly-happiness-q5q66rq9g7c4gxp-3000.app.github.dev/lib/jpg/header/app1ifd.js:174:12)
                let parts = stack.split("\n")[2].split(":");
                let a = _CN("a", {style:"color:yellow",target:"_blank",href:`https://github.com/Adrianotiger/jpeg-exif-lib-js/blob/main${parts[1].substring(parts[1].indexOf("/lib/jpg/"))}#L${parts[2]}`}, ["[GitHub]"]);
                _CN("div", {style:"color:orange;"}, ["⚠️" +  message + " ", a], logDiv);
            }
            else
            {
                _CN("div", {style:"color:orange;"}, ["⚠️" +  message], logDiv);
            }
            originalWarn.apply(console, args);
            showMsg();
        };
        console.error = function (...args) {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(" ");
            const stack = new Error().stack;
            _CN("div", {style:"color:pink;"}, ["⛔" +  message], logDiv);
            originalError.apply(console, args);
            showMsg();
        };
    }

};
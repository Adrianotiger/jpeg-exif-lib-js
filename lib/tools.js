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

};
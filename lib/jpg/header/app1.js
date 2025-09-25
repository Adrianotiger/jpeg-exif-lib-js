
class JPGApp1 extends JpgSection
{	
	#nextIfd = 1;
	#rationalOffset = 0;
	#usePadding = true;
	#ifds = {ifd0:null, subifd:null, gpsinfo:null, interifd:null, ifd1:null};
	
	constructor(buffer, offset)
	{
		let fillInital = false;
		if(!buffer)  // create Section if it doesn't exists
		{
			let buffer2 = new Uint8Array(24);
			buffer = buffer2.buffer;
			fillInital = true;
		}
			
		super(buffer, offset, "app1");
				
		JPGCONST['EXIF_ID']  = new JpgConst({value:0x457869660000, description:"EXIF Identifier"});
		JPGCONST['HTTP_ID']  = new JpgConst({value:0x687474703a2f, description:"HTTP Identifier"});
		
		//JPGCONST['EXIF_' + JPGCONST.EXIF.EXIF_VERSION.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXIF_VERSION, description:"EXIF Version", class:JPGTag9000});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.DATETIME_DIGIT.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.DATETIME_DIGIT, description:"DateTime Digitized", class:JPGTag9004});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.DATETIME_ORIG.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.DATETIME_ORIG, description:"DateTime Original", class:JPGTag9003});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.OFFSET_TIME.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.OFFSET_TIME, description:"Offset Time", class:JPGTag9011});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.COMP_CONFIG.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.COMP_CONFIG, description:"Components Configuration", class:JPGTag9101});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.SHUTTER_SPEED.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.SHUTTER_SPEED, description:"Shutter Speed Value", class:JPGTag9201});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.APERTURE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.APERTURE, description:"Aperture Value", class:JPGTag9202});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.BRIGHTNESS.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.BRIGHTNESS, description:"Brightness Value", class:JPGTag9203});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.EXPOSURE_BIAS.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXPOSURE_BIAS, description:"Exposure Bias Value", class:JPGTag9204});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.MAX_APERTURE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.MAX_APERTURE, description:"Max Aperture Value", class:JPGTag9205});
		//JPGCONST['EXIF_' + JPGCONST.EXIF.INTEROP_IFD_OFF.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.INTEROP_IFD_OFF, description:"Exif Interoperability Offset", class:JPGTaga005});
		JPGCONST['EXIF_Unknown']  = new JpgConst({value:0xFFFF2, description:"Unknown Tag", class:JPGTagUnknown});

		/**
		 * JPG\Headers\app1 format:
		 *  ----------------------------
		 * | Marker ID       | 2 bytes | 
		 *  ----------------------------
		 * | Marker Size     | 2 bytes |
		 *  ----------------------------
		 * | Identifier      | ? bytes |  << EXIF and http:/ are supported at the moment
		 *  ----------------------------
		 * | ...             | ? bytes |	<< See EXIF or HTTP Function inside this file
		 *  ----------------------------
		 */
		
		if(fillInital)
		{
			this.view.setUint16(0, JPGCONST['APP1'].Value);
			this.view.setUint16(2, 16);
			this.view.setUint32(4, Number(BigInt(JPGCONST['EXIF_ID'].Value) >> 16n));
			this.view.setUint16(8, Number(BigInt(JPGCONST['EXIF_ID'].Value) & 0x0ffffn)); // Exif-00
			this.view.setUint16(10, 0x4D4D); // big endian
			this.view.setUint16(12, 0x002A); // magic nr
			this.view.setUint32(14, 0x0008); // offset (always 8)
			this.view.setUint16(18, 0); // tags (0)
			this.view.setUint32(20, 0); // nextIfd
		}
		
		this.addAttribute("sectionId", JPGCONST['APP1'].BytesLen, "section ID");
		this.addAttribute("sectionSize", JPGCONST['APP1'].BytesLen, "section size");
		this.addAttribute("identifier", 6, "App1 Identifier", true);
		
		if(this.getAttribute("identifier").localeCompare("Exif") === 0)
		{
			this.#parseExif(buffer);
		}
		else if(this.getAttribute("identifier").localeCompare("http:/") === 0)
		{
			this.#parseHttp(buffer);
		}
		else
		{
			console.error("Unknown Identifier 0x" + this.getAttribute("identifier"));
		}
		
		
		console.log(this.attributes);
	}
	
	#parseExif(buffer)
	{
		/**
		 * JPG\Headers\app1 format:
		 *  ----------------------------
		 * | Marker ID       | 2 bytes | << APP1
		 *  ----------------------------
		 * | Marker Size     | 2 bytes |
		 *  ----------------------------
		 * | Identifier      | 6 bytes | << EXIF
		 *  ----------------------------
		 * | Endian          | 2 bytes |
		 *  ----------------------------
		 * | MagicNr         | 2 bytes |
		 *  ----------------------------
		 * | idxOffset       | 4 bytes |
		 *  ----------------------------
		 * | SUB-Sections    | ? bytes | << See IFD0, IFD1, SubIFD, GPSInfo, ...
		 *  ----------------------------
		 */

		this.#rationalOffset = this.getAttributesSize();
		this.addAttribute("endian", 2);
		switch(this.getAttribute("endian"))
		{
			case 0x4d4d: this.bigEndian = true; break;
			case 0x4949: this.bigEndian = false; break;
			default: console.error(`Invalid Endian value (0x${this.getAttribute("endian").toString(16)})`);
		}
		this.addAttribute("magicNr", 2);
		this.addAttribute("idxOffset", 4);
		
		if(this.getAttribute("magicNr") !== 0x002a) console.error(`Invalid magic Nr value (0x${this.getAttribute("magicNr").toString(16)}, expected:0x2a)`);
		if(this.getAttribute("idxOffset") !== 0x08) console.error(`Invalid idxOffset value (0x${this.getAttribute("magicNr").toString(16)}, expected: 0x8)`);
						
		let ifdKeys = Object.keys(this.#ifds);//["IFD0", "SubIFD", "GPSInfo", "InterIFD", "IFD1"];
		let ifdIndex = 0;
		let ifdSubIndex = -1;
		let ifd1Index = -1;
		
		let ifdPresent = {...this.#ifds};
		ifdPresent['ifd0'] = this.getAttributesSize();
		
		for(ifdIndex=0;ifdIndex<ifdKeys.length;ifdIndex++)
		{
			let buffOffset = ifdPresent[ifdKeys[ifdIndex]];
			
			if(!ifdPresent[ifdKeys[ifdIndex]]) continue;
			
			let ifdClass = new JPGApp1IFD(
							this.view.buffer.slice(buffOffset), 
							this.offset + buffOffset, 
							ifdKeys[ifdIndex], 
							this.bigEndian, 
							this.#rationalOffset - buffOffset);
			
			this.subsections.push(ifdClass);
			
			console.log(ifdKeys[ifdIndex] + " size: " + ifdClass.getSize());
			buffOffset += ifdClass.getSize();
			
			if(buffOffset > buffer.byteLength)
			{
				console.error("Wrong offset after reading " + ifdKeys[ifdIndex] + ". Abort reading...");
				break;
			}
			
			this.#ifds[ifdKeys[ifdIndex]] = ifdClass;
			
			/**
			 * After reading ifd0, we know where and if subifd, ifd1 and interoperabiliy IFD are present.
			 */
			if(ifdIndex === 0) // IFD0
			{
				ifdClass.subsections.forEach(ss=>{
					switch(ss.Tag)
					{
						case JPGCONST.EXIF.SUBIFDOFFSET: ifdPresent['subifd'] = this.#rationalOffset + ss.getAttribute("value"); break; // sub IFD found
						case JPGCONST.EXIF.GPSINFO: ifdPresent['gpsinfo'] = this.#rationalOffset + ss.getAttribute("value"); break; // GPS INFO IFD found
					}
				});
				ifdPresent['ifd1'] = ifdClass.getNextId() > 0 ? ifdClass.getNextId() + this.#rationalOffset : null;
			}
			else if(ifdIndex === 1) // Sub IFD
			{
				ifdClass.subsections.forEach(ss=>{
					switch(ss.Tag)
					{
						case JPGCONST.EXIF.INTEROP_IFD_OFF: ifdPresent['interifd'] = this.#rationalOffset + ss.getAttribute("value"); break; // Interoperability IFD found
					}
				});
			}
		};
	}
	
	#parseHttp(buffer)
	{
		/**
		 * JPG\Headers\app1 format:
		 *  ----------------------------
		 * | Marker ID       | 2 bytes | << APP1
		 *  ----------------------------
		 * | Marker Size     | 2 bytes |
		 *  ----------------------------
		 * | Identifier      | ? bytes | << http:/
		 *  ----------------------------
		 * | XML Data        | ? bytes | << read up to \0, or section size
		 *  ----------------------------
		 */
		let offset = this.getAttributesSize();
		while(this.view.getUint8(offset++) !== 0);
		
		this.addAttribute("identifierex", offset - this.getAttributesSize(), "App1 Identifier", true);
		this.addAttribute("xml", this.getAttribute("sectionSize") - offset + 2, "XMP Data", true);
	}
	
	getRationalBaseOffset(ifd)
	{
		return this.offset + this.#rationalOffset;
	}
	
	getExif(exifConst)
	{
		let ret = null;
		this.subsections.forEach(ss=>{
			if(ret) return;
			ret = ss.getExif(exifConst);
		});
		return ret;
	}
	
	setExif(exifConst, value)
	{
		let ifd0Const = [0x100, 0x101, 0x10e, 0x10f, 0x110, 0x112, 0x11a, 0x11b, 0x128, 0x131, 0x132, 0x13e, 0x13f, 0x211, 0x212, 0x213, 0x214, 0x8298, 0x8769];
		let ifdSubConst = [0x001, 0x002, 0x00b, 0x13b, 0x829a, 0x829d, 0x8822, 0x8825, 0x8827, 0x9000, 0x9003, 0x9004, 0x9011, 0x9101, 0x9201, 0x9202, 0x9203, 0x9204, 0x9205, 0x9207, 0x9208, 0x9209];
		
		if(ifd0Const.indexOf(exifConst) >= 0) 
		{
			if(!this.subsections[0]) // there is no subsection 0 (no IFD0). Create it now.
			{
				this.subsections[0] = 
					new JPGApp1IFD(
							null, 
							-1, 
							Object.keys(this.#ifds)[0], 
							this.bigEndian, 
							-1)
				;
			}
			this.subsections[0].setExif(exifConst, value);
		}
		else if(ifdSubConst.indexOf(exifConst) >= 0) 
		{
			if(!this.subsections[1]) // there is no subsection 1 (no SubIFD). Create it now.
			{
				this.subsections[1] =
					new JPGApp1IFD(
							null, 
							-1, 
							Object.keys(this.#ifds)[1], 
							this.bigEndian, 
							-1)
				;

				this.setExif(JPGCONST.EXIF.SUBIFDOFFSET, 1);
			}

			this.subsections[1].setExif(exifConst, value);
		}
		else
		{
			console.error(`EXIF ID 0x${exifConst.toString(16)} not found in any available IFDs.`);
		}
	}
	
	getBuffer(asByteArray)
	{		
		let buff = new Uint8Array(18);
		
		// copy app1 header
		buff.set(new Uint8Array(this.view.buffer.slice(0, 18)), 0);
		
		if(this.getAttribute("identifier").localeCompare("Exif") === 0)
		{
			let subifdOffset = 0;
			let gpsifdOffset = 0;
			let intifdOffset = 0;
			let ifd1Offset = 0;

			const app1ExifOffset = -10;


			this.subsections.forEach((ss, index)=>{
				const buffdw = new DataView(buff.buffer);
				const ifdBaseOffset = buff.byteLength;
				const ab2 = ss.getBuffer(true, buff.byteLength - 8); /*asArrayBuffer, rational offset*/

				switch(ss.name)
				{
					case 'subifd':
						if(subifdOffset > 0) buffdw.setUint32(subifdOffset, buff.byteLength + app1ExifOffset, !this.bigEndian);
						else console.warn("There is a subifd block without an offset to it!");
						break;
					case 'ifd1':
						if(ifd1Offset > 0) buffdw.setUint32(ifd1Offset, buff.byteLength + app1ExifOffset, !this.bigEndian);
						else console.warn("There is a ifd1 block without an offset to it!");
						break;
					case 'gpsinfo':
						if(gpsifdOffset > 0) buffdw.setUint32(gpsifdOffset, buff.byteLength + app1ExifOffset, !this.bigEndian);
						else console.warn("There is a gpsinfo block without an offset to it!");
						break;
					case 'interifd':
						if(intifdOffset > 0) buffdw.setUint32(intifdOffset, buff.byteLength + app1ExifOffset, !this.bigEndian);
						else console.warn("There is a interoperable ifd block without an offset to it!");
						break;
				}

				let buff2 = new Uint8Array(buff.byteLength + ab2.byteLength);
				buff2.set(new Uint8Array(buff), 0);
				buff2.set(new Uint8Array(ab2), buff.byteLength);

				buff = buff2;

				switch(ss.name)
				{
					case 'ifd0':
					{
						ss.subsections.forEach((ss2, tagIndex)=>{
							if(ss2.Tag == JPGCONST.EXIF.SUBIFDOFFSET) {
								subifdOffset = ifdBaseOffset + 2 /*number of tags*/ + tagIndex * 12 /*12 bytes for each tag*/ + 8/*offset position*/;
							}
						});	
						ss.subsections.forEach((ss2, tagIndex)=>{
							if(ss2.Tag == JPGCONST.EXIF.GPSINFO) {
								gpsifdOffset = ifdBaseOffset + 2 /*number of tags*/ + tagIndex * 12 /*12 bytes for each tag*/ + 8/*offset position*/;
							}
						});

						ifd1Offset = ifdBaseOffset + 2 /*number of tags*/ + this.subsections[0].subsections.length * 12 /*12 bytes for each tag*/ ;
					}
					case 'subifd':
					{
						ss.subsections.forEach((ss2, tagIndex)=>{
							if(ss2.Tag == JPGCONST.EXIF.INTEROP_IFD_OFF) {
								intifdOffset = ifdBaseOffset + 2 /*number of tags*/ + tagIndex * 12 /*12 bytes for each tag*/ + 8/*offset position*/;
							}
						});	
					}
				}
				console.log("INDEX: " + index);
			});
		}
		else if(this.getAttribute("identifier").localeCompare("http:/") === 0)
		{
			const buffdw = new DataView(buff.buffer);
			const ab2 = this.view.buffer.slice(18);
			
			let buff2 = new Uint8Array(buff.byteLength + ab2.byteLength);
			buff2.set(new Uint8Array(buff), 0);
			buff2.set(new Uint8Array(ab2), buff.byteLength);

			buff = buff2;
		}
		
				
		return buff;
	}
};

_CN("script", {src:BASEURL+"jpg/header/app1tag.js", type:"text/javascript"}, [], document.head).addEventListener("load", ()=>{
	scripts = [
		BASEURL+"jpg/header/app1ifd.js", 
		BASEURL+"jpg/header/app1/1.js", 
		BASEURL+"jpg/header/app1/2.js", 
		BASEURL+"jpg/header/app1/b.js", 
		BASEURL+"jpg/header/app1/100.js", 
		BASEURL+"jpg/header/app1/101.js", 
		BASEURL+"jpg/header/app1/10f.js", 
		BASEURL+"jpg/header/app1/110.js", 
		BASEURL+"jpg/header/app1/112.js", 
		BASEURL+"jpg/header/app1/11a.js", 
		BASEURL+"jpg/header/app1/11b.js", 
		BASEURL+"jpg/header/app1/128.js", 
		BASEURL+"jpg/header/app1/131.js", 
		BASEURL+"jpg/header/app1/132.js", 
		BASEURL+"jpg/header/app1/13b.js", 
		BASEURL+"jpg/header/app1/211.js", 
		BASEURL+"jpg/header/app1/212.js", 
		BASEURL+"jpg/header/app1/213.js", 
		BASEURL+"jpg/header/app1/214.js", 
		BASEURL+"jpg/header/app1/8298.js", 
		BASEURL+"jpg/header/app1/829a.js", 
		BASEURL+"jpg/header/app1/829d.js", 
		BASEURL+"jpg/header/app1/8769.js", 
		BASEURL+"jpg/header/app1/8822.js", 
		BASEURL+"jpg/header/app1/8825.js", 
		BASEURL+"jpg/header/app1/8827.js", 
		BASEURL+"jpg/header/app1/9000.js", 
		BASEURL+"jpg/header/app1/9003.js", 
		BASEURL+"jpg/header/app1/9004.js", 
		BASEURL+"jpg/header/app1/9011.js", 
		BASEURL+"jpg/header/app1/9101.js", 
		BASEURL+"jpg/header/app1/9201.js", 
		BASEURL+"jpg/header/app1/9202.js", 
		BASEURL+"jpg/header/app1/9203.js", 
		BASEURL+"jpg/header/app1/9204.js", 
		BASEURL+"jpg/header/app1/9205.js", 
		BASEURL+"jpg/header/app1/9207.js", 
		BASEURL+"jpg/header/app1/9208.js", 
		BASEURL+"jpg/header/app1/9209.js", 
		BASEURL+"jpg/header/app1/a005.js", 
		BASEURL+"jpg/header/app1/unknown.js"
	].forEach(s=>{
		_CN("script", {src:s, type:"text/javascript"}, [], document.head);
	});
});
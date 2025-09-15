class JpgTagSection extends JpgSection	// 2 bytes for Tag, 2 bytes for Type, 4 for Lenght (or Denomination), 4 for Offset (or Numerator)
{
	Tag = 0x00;
	Type = 0x00;
	Length = 0;
	DataOffset = 0;
	RationalData = [];
	TagType = "invalid";
	TagOptions = {};
	IsUserEditable = true;
	
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, name);
		this.bigEndian = bigEndian;
		
		this.addAttribute("tag", 2);
		this.addAttribute("type", 2);
		this.addAttribute("length", 4);
		const len = this.getAttribute("length");
		switch(this.getAttribute("type"))
		{
			case 1: for(let j=0;j<len;j++) this.addAttribute("value", 1, "unsigned byte"); break;
			case 6: for(let j=0;j<len;j++) this.addAttribute("value", 1, "signed byte"); break;
			case 3: for(let j=0;j<len;j++) this.addAttribute("value", 2, "unsigned short"); break;
			case 8: for(let j=0;j<len;j++) this.addAttribute("value", 2, "signed short"); break;
			case 4: this.addAttribute("value", 4, "unsigned long"); break;
			case 9: this.addAttribute("value", 4, "signed long"); break;
			case 2: 
							if(this.getAttribute("length") < 5) // if length is less than 5 bytes, they are read directly from the tag, without offset
								this.addAttribute("value", this.getAttribute("length"), "ASCII short", true);
							else
								this.addAttribute("offset", 4, "ASCII rational");
							break;
			case 5: this.addAttribute("offset", 4, "unsigned rational"); break;
			case 10: this.addAttribute("offset", 4, "signed rational"); break;
			case 7: if(this.getAttribute("length") < 5) 
								this.addAttribute("value", this.getAttribute("length"), "undefined", true); 
							else 
								this.addAttribute("offset", 4, "undefined"); 
							break;
			case 11: this.addAttribute("value", 4, "single float"); break;
			case 12: this.addAttribute("offset", 4, "double float"); break;
		}
		
		//checks
		switch(this.getAttribute("type"))
		{
			case 1:
			case 6: if(len > 4) console.warn("Tag can be only 4 bytes long, not " + len); break;
			case 3:
			case 8: if(len > 2) console.warn("Tag can be only 2 bytes long, not " + len); break;
			case 4:
			case 9: if(len > 1) console.warn("Tag can be only 1 byte long, not " + len); break;
		}
		
		
		this.Tag = this.view.getUint16(0, !bigEndian);
		this.Type = this.view.getUint16(2, !bigEndian);
		this.Length = this.view.getUint32(4, !bigEndian);
		this.DataOffset = this.view.getUint32(8, !bigEndian);
		
		if(!this.getAttribute("value")) this.RationalData = [];
		else if(Array.isArray(this.getAttribute("value"))) this.RationalData = this.getAttribute("value");
		else this.RationalData = [this.getAttribute("value")];
	}
	
	setValue(len, off)
	{
		if(Array.isArray(len))
		{
			this.Length = len.length;
			this.RationalData = len;
		}
		if(this.Type === 0x05 || this.Type === 0x0a)
		{
			this.Length = 1;
			this.RationalData = len;
		}
		else if(this.Type === 0x02 || this.Type === 0x07) // Ascii or undefined
		{
			if(len.length > 4)
			{
				this.RationalData = len;
				this.DataOffset = 0xffffffff; 	// need to be recalcolated!
			}
			else
			{
				this.RationalData = len;
				this.DataOffset = -1;
			}
			this.Length = len.length;
		}
		else
		{
			this.Length = len;
			if(off)
				this.DataOffset = off;
			else 
				this.DataOffset = 0xffffffff;	// need to be recalculated!
		}
	}
	
	getBuffer(dataOffset)
	{
		let ret = new Uint8Array(12);
		let rev = new DataView(ret.buffer);
		
		rev.setUint16(0, this.Tag, !this.bigEndian);
		rev.setUint16(2, this.Type, !this.bigEndian);
		rev.setUint32(4, this.Length, !this.bigEndian);
		if(this.isRational())
		{
			rev.setUint32(8, dataOffset, !this.bigEndian);
		}
		else
		{
			switch(this.Type)
			{
				case 2:
				case 7: for(let k=0;k<this.Length;k++) rev.setUint8(8 + k, Array.isArray(this.RationalData)&&this.RationalData.length===this.Length?this.RationalData[k]:this.RationalData[0][k].charCodeAt(0), !this.bigEndian); break;
				case 1:
				case 5:
				case 6: for(let k=0;k<this.Length;k++) rev.setUint8(8 + k, this.RationalData[k], !this.bigEndian); break;
				case 3:
				case 8: for(let k=0;k<this.Length;k++) rev.setUint16(8 + k*2, this.RationalData[k], !this.bigEndian); break;
				case 4:
				case 9: for(let k=0;k<this.Length;k++) rev.setUint32(8 + k*4, this.RationalData[k], !this.bigEndian); break;
			}
			
		}
		
		return ret;
	}
	
	getRationalDataOffset()
	{
		if(this.isRational())
			return this.DataOffset;
		return -1;
	}
	
	isRational()
	{
		if(this.Type === 0x05 || this.Type === 0x0a) return true;
		if((this.Type === 0x02 || this.Type === 0x07) && this.Length > 4) return true;
		return false;
	}
	
	getRationalSize()
	{
		if(!this.isRational()) return 0;
		if(this.Type === 0x05 || this.Type === 0x0a) return 8;
		return this.Length;
	}
	
	isRationalString()
	{
		return (this.isRational() && (this.Type === 0x02 || this.Type === 0x07));
	}
}


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
		
		JPGCONST['EXIF_' + JPGCONST.EXIF.INTEROP_INDEX.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.INTEROP_INDEX, description:"Interoperability Index", class:JPGTag1});
		JPGCONST['EXIF_' + JPGCONST.EXIF.INTEROP_VERSION.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.INTEROP_VERSION, description:"Interoperability Version", class:JPGTag2});
		JPGCONST['EXIF_' + JPGCONST.EXIF.IMAGE_WIDTH.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.IMAGE_WIDTH, description:"Image Width", class:JPGTag100});
		JPGCONST['EXIF_' + JPGCONST.EXIF.IMAGE_HEIGHT.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.IMAGE_HEIGHT, description:"Image Length (Height)", class:JPGTag101});
		JPGCONST['EXIF_' + JPGCONST.EXIF.MAKE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.MAKE, description:"Make", class:JPGTag10f});
		JPGCONST['EXIF_' + JPGCONST.EXIF.MODEL.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.MODEL, description:"Model", class:JPGTag110});
		JPGCONST['EXIF_' + JPGCONST.EXIF.ORIENTATION.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.ORIENTATION, description:"Make (Model)", class:JPGTag112});
		JPGCONST['EXIF_' + JPGCONST.EXIF.RESOLUTION_X.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.RESOLUTION_X, description:"Resolution X", class:JPGTag11a});
		JPGCONST['EXIF_' + JPGCONST.EXIF.RESOLUTION_Y.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.RESOLUTION_Y, description:"Resolution Y", class:JPGTag11b});
		JPGCONST['EXIF_' + JPGCONST.EXIF.RESOLUTION_UNIT.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.RESOLUTION_UNIT, description:"Resolution Unit", class:JPGTag128});
		JPGCONST['EXIF_' + JPGCONST.EXIF.SOFTWARE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.SOFTWARE, description:"Software", class:JPGTag131});
		JPGCONST['EXIF_' + JPGCONST.EXIF.DATETIME.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.DATETIME, description:"DateTime Original", class:JPGTag132});
		JPGCONST['EXIF_' + JPGCONST.EXIF.YCBCR_COEFF.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.YCBCR_COEFF, description:"YCbCr Coefficient", class:JPGTag211});
		JPGCONST['EXIF_' + JPGCONST.EXIF.YCBCR_SUBSAMP.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.YCBCR_SUBSAMP, description:"YCbRc Sub Sampling", class:JPGTag212});
		JPGCONST['EXIF_' + JPGCONST.EXIF.YCBCR_POS.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.YCBCR_POS, description:"YCbCr Positioning", class:JPGTag213});
		JPGCONST['EXIF_' + JPGCONST.EXIF.REFERENCE_BW.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.REFERENCE_BW, description:"Reference Black White", class:JPGTag214});
		JPGCONST['EXIF_' + JPGCONST.EXIF.SUBJECT_LOCATION.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.SUBJECT_LOCATION, description:"Subject Location", class:JPGTag882});
		JPGCONST['EXIF_' + JPGCONST.EXIF.SUBIFDOFFSET.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.SUBIFDOFFSET, description:"SubIFD Offset", class:JPGTag8769});
		JPGCONST['EXIF_' + JPGCONST.EXIF.COPYRIGHT.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.COPYRIGHT, description:"Copyright", class:JPGTag8298});
		JPGCONST['EXIF_' + JPGCONST.EXIF.EXPOSURE_TIME.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXPOSURE_TIME, description:"Exposure Time", class:JPGTag829a});
		JPGCONST['EXIF_' + JPGCONST.EXIF.FNUMBER.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.FNUMBER, description:"Focal Number", class:JPGTag829d});
		JPGCONST['EXIF_' + JPGCONST.EXIF.EXPOSURE_PROG.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXPOSURE_PROG, description:"Exposure Program", class:JPGTag8822});
		JPGCONST['EXIF_' + JPGCONST.EXIF.GPSINFO.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.GPSINFO, description:"GPS Info", class:JPGTag8825});
		JPGCONST['EXIF_' + JPGCONST.EXIF.ISOSPEED.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.ISOSPEED, description:"ISO Speed Rating", class:JPGTag8827});
		JPGCONST['EXIF_' + JPGCONST.EXIF.EXIF_VERSION.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXIF_VERSION, description:"EXIF Version", class:JPGTag9000});
		JPGCONST['EXIF_' + JPGCONST.EXIF.DATETIME_DIGIT.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.DATETIME_DIGIT, description:"DateTime Digitized", class:JPGTag9004});
		JPGCONST['EXIF_' + JPGCONST.EXIF.DATETIME_ORIG.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.DATETIME_ORIG, description:"DateTime Original", class:JPGTag9003});
		JPGCONST['EXIF_' + JPGCONST.EXIF.OFFSET_TIME.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.OFFSET_TIME, description:"Offset Time", class:JPGTag9011});
		JPGCONST['EXIF_' + JPGCONST.EXIF.COMP_CONFIG.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.COMP_CONFIG, description:"Components Configuration", class:JPGTag9101});
		JPGCONST['EXIF_' + JPGCONST.EXIF.SHUTTER_SPEED.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.SHUTTER_SPEED, description:"Shutter Speed Value", class:JPGTag9201});
		JPGCONST['EXIF_' + JPGCONST.EXIF.APERTURE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.APERTURE, description:"Aperture Value", class:JPGTag9202});
		JPGCONST['EXIF_' + JPGCONST.EXIF.BRIGHTNESS.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.BRIGHTNESS, description:"Brightness Value", class:JPGTag9203});
		JPGCONST['EXIF_' + JPGCONST.EXIF.EXPOSURE_BIAS.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.EXPOSURE_BIAS, description:"Exposure Bias Value", class:JPGTag9204});
		JPGCONST['EXIF_' + JPGCONST.EXIF.MAX_APERTURE.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.MAX_APERTURE, description:"Max Aperture Value", class:JPGTag9205});
		JPGCONST['EXIF_' + JPGCONST.EXIF.INTEROP_IFD_OFF.toString(16)]  = new JpgConst({value:JPGCONST.EXIF.INTEROP_IFD_OFF, description:"Exif Interoperability Offset", class:JPGTaga005});
		JPGCONST['EXIF_Unknown']  = new JpgConst({value:0xFFFF2, description:"Unknown Tag", class:JPGTagUnknown});
		
		if(fillInital)
		{
			this.view.setUint16(0, JPGCONST['APP1'].Value);
			this.view.setUint16(2, 16);
			this.view.setUint32(4, JPGCONST['EXIF_ID'].Value);
			this.view.setUint16(8, 0x0); // Exif-00
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
		return this.subsections[exifConst] ?? null;
	}
	
	setExif(exifConst, value)
	{
		let ifd0Const = [0x100, 0x101, 0x10e, 0x10f, 0x110, 0x112, 0x11a, 0x11b, 0x128, 0x131, 0x132, 0x13e, 0x13f, 0x211, 0x212, 0x213, 0x214, 0x8298, 0x8769];
		
		if(ifd0Const.indexOf(exifConst) >= 0) this.subsections[0].setExif(exifConst, value);
		else this.subsections[1].setExif(exifConst, value);
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

scripts = [
	"jpg/header/app1ifd.js", 
	"jpg/header/app1/1.js", 
	"jpg/header/app1/2.js", 
	"jpg/header/app1/100.js", 
	"jpg/header/app1/101.js", 
	"jpg/header/app1/10f.js", 
	"jpg/header/app1/110.js", 
	"jpg/header/app1/112.js", 
	"jpg/header/app1/11a.js", 
	"jpg/header/app1/11b.js", 
	"jpg/header/app1/128.js", 
	"jpg/header/app1/131.js", 
	"jpg/header/app1/132.js", 
	"jpg/header/app1/211.js", 
	"jpg/header/app1/212.js", 
	"jpg/header/app1/213.js", 
	"jpg/header/app1/214.js", 
	"jpg/header/app1/882.js", 
	"jpg/header/app1/8298.js", 
	"jpg/header/app1/829a.js", 
	"jpg/header/app1/829d.js", 
	"jpg/header/app1/8769.js", 
	"jpg/header/app1/8822.js", 
	"jpg/header/app1/8825.js", 
	"jpg/header/app1/8827.js", 
	"jpg/header/app1/9000.js", 
	"jpg/header/app1/9003.js", 
	"jpg/header/app1/9004.js", 
	"jpg/header/app1/9011.js", 
	"jpg/header/app1/9101.js", 
	"jpg/header/app1/9201.js", 
	"jpg/header/app1/9202.js", 
	"jpg/header/app1/9203.js", 
	"jpg/header/app1/9204.js", 
	"jpg/header/app1/9205.js", 
	"jpg/header/app1/a005.js", 
	"jpg/header/app1/unknown.js"
].forEach(s=>{
	_CN("script", {src:s, type:"text/javascript"}, [], document.head);
});
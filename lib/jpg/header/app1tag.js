class JpgTagSection extends JpgSection	// 2 bytes for Tag, 2 bytes for Type, 4 for Lenght (or Denomination), 4 for Offset (or Numerator)
{
	Tag = 0x00;
	Type = 0x00;
	Length = 0;
	DataOffset = 0;
	RationalData = [];
	TagOptions = {};

	IsUserEditable = true;

  IsDate = false;
  IsNumber = false;
  IsString = false;
  IsArray = false;
	IsOffset = false;
	
	constructor(buffer, offset, name, bigEndian, defaultTag)
	{
		if(!buffer)
		{
			console.log("Create new TAG/Buffer for " + name, "0x"+defaultTag.toString(16));
			buffer = (new Uint8Array(12)).buffer;
			let bv = new DataView(buffer);
			bv.setInt16(0, defaultTag, !bigEndian);
			bv.setInt16(2, JPGCONST['EXIF_' + defaultTag.toString(16)].Defaults.type, !bigEndian);
			bv.setInt32(4, JPGCONST['EXIF_' + defaultTag.toString(16)].Defaults.length, !bigEndian);
			bv.setInt32(8, JPGCONST['EXIF_' + defaultTag.toString(16)].Defaults.value, !bigEndian);
		}
		super(buffer, offset, name);
		this.bigEndian = bigEndian;
		
		this.addAttribute("tag", 2);
		this.addAttribute("type", 2);
		this.addAttribute("length", 4);
		const len = this.getAttribute("length");
		switch(this.getAttribute("type"))
		{
			case 1: for(let j=0;j<len;j++) this.addAttribute("value", 1, "unsigned byte"); this.IsNumber = true; break;
			case 6: for(let j=0;j<len;j++) this.addAttribute("value", 1, "signed byte"); this.IsNumber = true; break;
			case 3: for(let j=0;j<len;j++) this.addAttribute("value", 2, "unsigned short"); this.IsNumber = true; break;
			case 8: for(let j=0;j<len;j++) this.addAttribute("value", 2, "signed short"); this.IsNumber = true; break;
			case 4: this.addAttribute("value", 4, "unsigned long"); this.IsNumber = true; break;
			case 9: this.addAttribute("value", 4, "signed long"); this.IsNumber = true; break;
			case 2: 
							if(this.getAttribute("length") < 5) // if length is less than 5 bytes, they are read directly from the tag, without offset
								this.addAttribute("value", this.getAttribute("length"), "ASCII short", true);
							else
								this.addAttribute("offset", 4, "ASCII rational");
                            this.IsString = true;
							break;
			case 5: this.addAttribute("offset", 4, "unsigned rational"); this.IsNumber = true; break;
			case 10: this.addAttribute("offset", 4, "signed rational"); this.IsNumber = true; break;
			case 7: if(this.getAttribute("length") < 5) 
								this.addAttribute("value", this.getAttribute("length"), "undefined", true); 
							else 
								this.addAttribute("offset", 4, "undefined"); 
							break;
			case 11: this.addAttribute("value", 4, "single float"); this.IsNumber = true; break;
			case 12: this.addAttribute("offset", 4, "double float"); this.IsNumber = true; break;
		}
		
		this.Tag = this.view.getUint16(0, !bigEndian);
		this.Type = this.view.getUint16(2, !bigEndian);
		this.Length = this.view.getUint32(4, !bigEndian);
		this.DataOffset = this.view.getUint32(8, !bigEndian);
		
		if(!this.getAttribute("value")) this.RationalData = [];
		else if(Array.isArray(this.getAttribute("value"))) this.RationalData = this.getAttribute("value");
		else this.RationalData = [this.getAttribute("value")];
	}

	performChecks()
	{
		const len = this.getAttribute("length");

		if(!this.IsDate && !this.IsNumber && !this.IsString && !this.IsArray)
		{
			console.error("Code error: Value-Type is not set in this class.", "0x"+this.Tag.toString(16)); ;
		}
		if(!JPGCONST['EXIF_' + this.Tag.toString(16)]?.Defaults.type)
		{
			console.error("Code error: Tag-Type is not set in this class.", "0x"+this.Tag.toString(16)); 
		}

		//checks
		switch(this.getAttribute("type"))
		{
			case 1:
			case 6: if(len > 4) console.warn("Tag can be only 4 bytes long, not " + len, this.Tag); break;
			case 3:
			case 8: if(len > 2) console.warn("Tag can be only 2 bytes long, not " + len, this.Tag); break;
			case 4:
			case 9: if(len > 1) console.warn("Tag can be only 1 byte long, not " + len, this.Tag); break;
			case 2:
			case 5:
			case 10: if(len > 4 && this.DataOffset < 20) console.warn(`Relation offset ${this.DataOffset} seems to be too low for an offset.`, "0x"+this.Tag.toString(16)); break;
		}

		if(JPGCONST['EXIF_' + this.Tag.toString(16)]?.Defaults.type != this.getAttribute("type"))
		{
			if(!(JPGCONST['EXIF_' + this.Tag.toString(16)]?.Defaults.type + 5 == this.getAttribute("type") ||
				   JPGCONST['EXIF_' + this.Tag.toString(16)]?.Defaults.type - 5 == this.getAttribute("type")))
			{
				console.warn(`This TAG should be of type ${JPGCONST['EXIF_' + this.Tag.toString(16)]?.Defaults.type} and not ${this.getAttribute("type")}`, "0x"+this.Tag.toString(16));
			}
		}
	}
	
	setValue(len, off)
	{
		if(Array.isArray(len))
		{
			this.Length = len.length;
			this.RationalData = len;
		}
		if(this.Type === 0x04 || this.Type === 0x05)
		{
			this.Length = 1;
			this.RationalData = len;
		}
		else if(this.Type === 0x02 || this.Type === 0x07) // Ascii or undefined
		{
			if(len instanceof Date)
			{
				len = len.getFullYear() + ":" + (1+len.getMonth()).toString().padStart(2,"0") + ":" + len.getDate().toString().padStart(2,"0") + " " + 
						len.getHours().toString().padStart(2,"0") + ":" + len.getMinutes().toString().padStart(2,"0") + ":" + len.getSeconds().toString().padStart(2,"0");
			}
			
			if(len.length > 4)
			{
				this.RationalData = len;
				this.DataOffset = 0xffffffff; 	// need to be recalcolated!
			}
			else
			{
				this.RationalData = [len];
				this.DataOffset = -1;
			}
			this.Length = len.length;
		}
		else if(this.IsNumber)
		{
			if(Array.isArray(this.RationalData) && !Array.isArray(len))
			{
				if(Array.isArray(this.RationalData))
					throw new Error(`Error setting value on TAG 0x${this.Tag}. An Array of with ${this.RationalData.length} items is expected.`);
				else
					throw new Error(`Error setting value on TAG 0x${this.Tag}. A Number is expected, not an array.`);
			}
			else
			{
				this.RationalData = len;
			}
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

	getValue()
	{
		if(!this.isRational())
		{
			return this.getAttribute("value");
		}
		return this.RationalData;
	}

	getDate()
	{
			if(!this.IsDate) return null;
			if(!this.IsString) return null;
			if(this.getValue().length < 19) return null;

			let dateParts = this.getValue().trim().split(" ");
			if(!dateParts || dateParts.length != 2) return null;
			let tP = [];
			for(let j=0;j<2;j++)
			{
				for(let k=0;k<3;k++)
				{
					tP.push(parseInt(dateParts[j].split(":")[k]));
				}
			}

			return new Date(tP[0], tP[1]-1, tP[2], tP[3], tP[4], tP[5]);
	}

	toString()
	{
		if(Array.isArray(this.getValue())) return this.getValue().join(", ");
		if(this.IsDate) return this.getDate().toLocaleString();
		return this.getValue();
	}
}


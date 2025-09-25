class JPGApp1IFD extends JpgSection
{
	#nextIfd = 0;
	
	RationalBuffer = [];
	#rationalBytes = 0;
	#totTags = 0;
	#ifdid = "";
	
	constructor(buffer, offset, ifdid, bigEndian, rationalOffset)
	{
		const TAGSIZE = 12;

		let fillInital = false;
		if(buffer == null) // create new IFD section
		{
			let buffer2 = new Uint8Array(6);
			buffer = buffer2.buffer;
			fillInital = true;
		}
		
		super(buffer, offset, ifdid);
		this.bigEndian = bigEndian;
		
		this.#ifdid = ifdid;

		if(fillInital)
		{
			this.view.setUint16(0, 0); // 0 tags
			this.view.setUint32(2, 0); // next ifd (ifd1)
		}
		
		let tag = 0;
		let rationalDataSize = 0;
		let subifd = 0;
		this.#rationalBytes = 0;
		this.addAttribute("totalTags" , 2);
		this.#totTags = this.getAttribute("totalTags");
		
		if(this.#totTags > 256)
		{
			console.error(`Total TAGS for ${ifdid}: ${this.#totTags}, probably a wrong offset. abort reading IFD.`);
			return;
		}

		offset = this.getAttributesSize();

		this.addAttribute("tagsRaw", this.#totTags*TAGSIZE);
		
		let rationalLengths = [];
		let firstDataOffset = -1;

		for(let jTag=0; jTag<this.#totTags; jTag++)
		{
			tag = this.view.getUint16(offset, !this.bigEndian);
			const tagType = this.#getTag(tag);

			const tagClass = new tagType.Class(
				this.view.buffer.slice(
					offset, 
					offset + TAGSIZE), 
				this.offset + offset,
				ifdid,
				this.bigEndian
			);

				// Only for Debug
			tagClass.performChecks();

			if(tagClass.Tag === JPGCONST.EXIF.SUBIFDOFFSET)
			{
				subifd = tagClass.DataOffset;
			}

			this.subsections.push(tagClass);
			rationalDataSize += tagClass.RationalData.length;

			if(tagClass.isRational())
			{
				if(firstDataOffset < 0) firstDataOffset = rationalOffset + tagClass.DataOffset;
				
				rationalLengths.push([tagClass.getRationalSize(), this.#rationalBytes + tagClass.getRationalSize()]);
				this.#rationalBytes += tagClass.getRationalSize();
				if(!tagClass.isRationalString()) // rational
				{
					tagClass.setValue([
						this.view.getUint32(rationalOffset + tagClass.DataOffset, !this.bigEndian),
						this.view.getUint32(rationalOffset + tagClass.DataOffset + 4, !this.bigEndian)
					]);

					this.RationalBuffer = this.RationalBuffer.concat(
						Array.from(
							new Uint8Array(
								this.view.buffer.slice(
									rationalOffset + tagClass.DataOffset, 
									rationalOffset + tagClass.DataOffset + 8
								)
							)
						)
					);
				}
				else // ascii
				{
					tagClass.setValue(
						new TextDecoder().decode(
							new Uint8Array(
								this.view.buffer.slice(rationalOffset + tagClass.DataOffset, rationalOffset + tagClass.DataOffset + tagClass.Length)
							)
						)
					);

					this.RationalBuffer = this.RationalBuffer.concat(
						Array.from(
							new Uint8Array(
								this.view.buffer.slice(
									rationalOffset + tagClass.DataOffset, 
									rationalOffset + tagClass.DataOffset + tagClass.Length
								)
							)
						)
					);
				}

				console.log(`Exif Data: 0x${tagClass.Tag.toString(16).padStart(4, " ")} (${tagType.Description}): ${tagClass.RationalData}`, tagClass);
			}
			else
			{
				console.log(`Exif Data: 0x${tagClass.Tag.toString(16).padStart(4, " ")} (${tagType.Description}): [${tagClass.Length}, ${tagClass.DataOffset}]`, tagClass);
			}

			offset += TAGSIZE;
		}
		
		console.log("Start address of Tags: 0x" + (this.offset + 2).toString(16));
		console.log("Start address of Rational data: 0x" + (this.offset + firstDataOffset).toString(16));
		console.log("Rational bytes: " + this.#rationalBytes);
		
		if(offset < firstDataOffset)
		{
			if(firstDataOffset - offset > 4) console.error(`Missing to read ${firstDataOffset - offset} up to the end of rational data `);
			
			this.addAttribute("next" , 4);
			if(this.getAttribute("next") !== 0) console.log("Link to IFD1 is not 0, it is " + this.getAttribute("next"), "Rational Offset is " + rationalOffset);
			this.#nextIfd = this.getAttribute("next");
		}
		else if(this.#ifdid === "ifd0")
		{
			this.addAttribute("next" , 4);
		}
		
		this.addAttribute("dataRaw", this.#rationalBytes);
		
		console.log(rationalLengths);
		
		//this.#nextIfd = 0;
	}
	
	#hasNextOffset()
	{
		return (this.getAttribute("next") !== null);
		//return (this.#ifdid === "IFD0" || this.#ifdid === "IFD1");
	}
	
	getNextId()
	{
		return this.#nextIfd;
	}
	
	getSize()
	{
		return this.#rationalBytes + this.#totTags * 12 + 2 /*tot tags*/ + (this.#hasNextOffset()?4:0) /*next idf*/;
	}

	getExif(exifConst)
	{
		let ret = null;
		this.subsections.forEach(ss=>{
			if(ret) return;
			if(ss.Tag == exifConst) ret = ss;
		})
		return ret;
	}
	
	setExif(exifConst, value)
	{
		let tag = null;
		this.subsections.forEach(ss=>{if(ss.Tag == exifConst) tag = ss;});
		// Does the tag exists? If not, create an empty tag
		if(!tag)
		{			
			const tagType = this.#getTag(exifConst);
				
			tag = new tagType.Class(
				null, 
				this.view.byteLength,
				"IFD NEW",
				this.bigEndian
			);

				// Only for Debug
			tag.performChecks();

			this.subsections.push(tag);
			//rationalDataSize += tagClass.RationalData.length;
		}
		
		tag.setValue(value);
	}
	
	getBuffer(asByteArray, rationalOffset)
	{		
		let dataOffset = 0;
		let localOffset = 0;
		let offset = 0;
		const totTags = Object.keys(this.subsections).length;
		let buff = new ArrayBuffer(1024 * 64 + 12 * totTags); // enough space for data (64kb)
		let dataView = new DataView(buff);
		let rationalLen = 0;
		
		// set Tags qty
		dataView.setUint16(0, totTags, !this.bigEndian);
		offset = 2;
		
		// DataOffset begins from idf offset - 8 (EXIF position) + tags * 12 + next IDF
		localOffset = 12 * totTags + (this.#hasNextOffset()?4:0) + 2;
		dataOffset = rationalOffset + localOffset - 2;
		Object.keys(this.subsections).forEach(sk=>
		{
			const secbuff = this.subsections[sk].getBuffer(dataOffset);
			for(let k=0;k<12;k++) dataView.setUint8(offset + k, secbuff[k]);
			
			if(this.subsections[sk].isRational())
			{
				dataView.setUint32(offset + 8, dataOffset, !this.bigEndian);
				if(this.subsections[sk].isRationalString())
				{
					for(let k=0;k<this.subsections[sk].Length;k++)
					{
						dataView.setUint8(localOffset + k, this.subsections[sk].RationalData[k].charCodeAt(0));
					}
					localOffset += this.subsections[sk].Length;
					dataOffset += this.subsections[sk].Length;
					rationalLen += this.subsections[sk].Length;
				}
				else
				{
					for(let k=0;k<this.subsections[sk].Length*2;k++)
					{
						dataView.setUint32(localOffset + k*4, this.subsections[sk].RationalData[k], !this.bigEndian);
					}
					localOffset += this.subsections[sk].Length * 8;
					dataOffset += this.subsections[sk].Length * 8;
					rationalLen += this.subsections[sk].Length * 8;
				}
			}
			offset += 12;
		});
		
		if(this.#hasNextOffset()) dataView.setUint32(offset, this.#nextIfd, !this.bigEndian);
		
		offset = localOffset;
				
		//console.log(new Uint8Array(this.view.buffer));
		//console.log(new Uint8Array(buff.slice(0, offset)));
		
		return new Uint8Array(buff.slice(0, offset));
	}
	
	#getTag(val)
	{
		let ret = null;
		Object.keys(JPGCONST).forEach(mk=>{
			if(JPGCONST[mk].Value === val) {ret=JPGCONST[mk]; return;}
		});
		if(ret === null) 
		{
			ret = JPGCONST['EXIF_Unknown'];
		}
		return ret;
	}
	
	
};
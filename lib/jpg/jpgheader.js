/**
 * 
 * @augments JpgSection
 */
class JPGHeader extends JpgSection
{		
	/**
	* The info data of the JPG are parsed here (EXIF)
	* @param {ArrayBuffer} buffer - The buffer to parse for this block
	* @param {offset} offset - the offset from the binary file (for debug)
	* @class
	* @constructor
	* @public
	*/
	constructor(buffer, offset)
	{
		super(buffer, offset, "header");
		
			// markers that can be found in the header
		JPGCONST['SOF0']  = new JpgConst({value:JPGCONST.MARKER.SOF0, description:"SOF Marker (Start Of Frame)", class:JPGSOF0});
		JPGCONST['DHT']   = new JpgConst({value:JPGCONST.MARKER.DHT, description:"DHT Marker (Define Huffman Table)", class:JPGDHT});
		JPGCONST['DQT']   = new JpgConst({value:JPGCONST.MARKER.DQT, description:"DQT Marker (Define Quantization Table)", class:JPGDQT});
		JPGCONST['APP0']  = new JpgConst({value:JPGCONST.MARKER.APP0, description:"App0 Marker", class:JPGApp0});
		JPGCONST['APP1']  = new JpgConst({value:JPGCONST.MARKER.APP1, description:"App1 Marker", class:JPGApp1});
		JPGCONST['APP2']  = new JpgConst({value:JPGCONST.MARKER.APP2, description:"App2 Marker", class:JPGApp2});
		JPGCONST['UnknownMarker'] = new JpgConst({value:0xFFFF1, description:"Unknown Marker", class:JPGUnknown});
		
		let marker = 0;
		let size = 0;
		let offsetRead = 0;
		
			// find all markers
		while(offsetRead < this.view.byteLength)
		{

		/**
		 * JPG\Headers format:
		 *  ----------------------------
		 * | Marker ID       | 2 bytes |	<< see JPGCONST['SOF0'], JPGCONST['APP1'], ...
		 *  ----------------------------
		 * | Marker Size     | 2 bytes |
		 *  ----------------------------
		 * | Marker Data     | ? bytes |
		 *  ----------------------------
		 * ^^^^ Base rule for each marker.
		 */

			marker = this.view.getUint16(offsetRead);
			const markerType = this.#getMarker(marker);
			size = this.view.getUint16(offsetRead + markerType.BytesLen);
			
			const markerClass = new markerType.Class(
				this.view.buffer.slice(
					offsetRead, 
					offsetRead + markerType.BytesLen + size), 
				offsetRead + offset
			);
			
			markerClass.marker = marker;
			
			this.subsections.push(markerClass);
			
			offsetRead += size + markerType.BytesLen;
		}
	}
	
		/** Returns the binary array of the image, so you can save or show it on the webpage.
		 * @override
		 * @returns {ArrayBuffer}
		 */
	getBuffer()
	{
		let buff = new ArrayBuffer(this.view.byteLength + 1024 * 1024); // big enough to store new data
		let dataView = new DataView(buff);
		let offset = 0;
		
		Object.keys(this.subsections).forEach(k=>{
			const sectionOffset = offset;
			const sectionBuff = this.subsections[k].getBuffer(true);
			sectionBuff.forEach(b=>{dataView.setUint8(offset++, b);});
			dataView.setUint16(sectionOffset + 2, sectionBuff.length - 2); // update size
		});
		
		return Array.from(new Uint8Array(buff.slice(0, offset)));
	}
	
	 /**
	  * Get an EXIF Tag. The EXIF is in the App1 section, so forward the request to this class.
		* @param {type} exifConst - If not set the entire app1 block is returned
		* @returns {JpgTagSection|null}
	  */
	getExif(exifConst)
	{
		for(let j=0;j<this.subsections.length;j++)
		{
			if(this.subsections[j].marker === JPGCONST.MARKER.APP1)
			{
				if(!exifConst) return this.subsections[j];
				return this.subsections[j].getExif(exifConst);
			}
		}
		return null;
	}
	
	/**
	  * Try to set a value for the EXIF. If it doesn't exists, create it.
		* @param {type} exifConst - See jpgconst.js for the EXIF values
		* @param {type} value - value, can be a string or a number
		* @returns {JpgTagSection|null}
	  */
	setExif(exifConst, value)
	{
		let app1 = null;
		for(let j=0;j<this.subsections.length;j++)
		{
			if(this.subsections[j].marker === JPGCONST.MARKER.APP1)
			{
				app1 = this.subsections[j];
				break;
			}
		}
		if(!app1) // App1 is not present, create it!
		{
			// APP 1 does not exists? Create it and call it again.
			let offsetMarkerApp0 = this.offset;
			for(let j=0;j<this.subsections.length;j++)
			{
				if(this.subsections[j].marker === JPGCONST.MARKER.APP0)
				{
					offsetMarkerApp0 = this.subsections[j].offset + this.subsections[j].getBuffer(false).byteLength;
				}
			}
			app1 = new (this.#getMarker(JPGCONST.MARKER.APP1).Class)(
				null, 
				offsetMarkerApp0
			);
			app1.marker = JPGCONST.MARKER.APP1;
			this.subsections.splice(1, 0, app1); // place it after App0 (we assume, app0 is always present)
		}		
		return app1.setExif(exifConst, value);
	}

	/**
	 * Removes a marker from the JPG (see JPGCONST.MARKER.APP2).
	 * You can save up to 0.5kb if you remove the APP2 (ICC Profile) from the canvas, for example.
	 * @param {number} use a constant to remove this marker
	 * @returns {boolean} - true if it was present and now it is removed
	 */
	removeMarkerBlock(marker)
	{
		for(let j=0;j<this.subsections.length;j++)
		{
			if(this.subsections[j].marker === marker)
			{
				this.subsections.splice(j, 1);
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Get the offset to use to save and find other IFD or Data inside the IFD.
	 * @param {type} ifd - should be 0
	 * @returns {number} returns the offset or -1 if it can't be found
	 */
	getRationalBaseOffset(ifd)
	{
		let app1 = null;
		for(let j=0;j<this.subsections.length;j++)
		{
			if(this.subsections[j].marker === JPGCONST.MARKER.APP1)
			{
				return this.subsections[j].getRationalBaseOffset(ifd);
				break;
			}
		}
		return -1;
	}
	
	/**
	 * Provide the number of the marker and it returns the description and class to use for this marker.
	 * @param {type} val
	 * @returns {JpgConst}
	 */
	#getMarker(val)
	{
		let ret = null;
		Object.keys(JPGCONST).forEach(mk=>{
			if(JPGCONST[mk].Value === val) {ret=JPGCONST[mk]; return;}
		});
		if(ret === null) 
		{
			ret = JPGCONST['UnknownMarker'];
		}
		return ret;
	}
};

// add new markers as script (subsections)
scripts = [
	BASEURL+"jpg/header/app0.js", 
	BASEURL+"jpg/header/app1.js", 
	BASEURL+"jpg/header/app2.js", 
	BASEURL+"jpg/header/dqt.js", 
	BASEURL+"jpg/header/dht.js", 
	BASEURL+"jpg/header/sof0.js", 
	BASEURL+"jpg/header/unknown.js"
].forEach(s=>{
	_CN("script", {src:s, type:"text/javascript"}, [], document.head);
});
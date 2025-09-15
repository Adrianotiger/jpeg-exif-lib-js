function _CN(e,t,r,n=null){var o=document.createElement(e);if("object"==typeof t)for(var a in t)o.setAttribute(a,t[a]);return Array.isArray(r)&&r.forEach(e=>{o.appendChild("string"==typeof e||"number"==typeof e?document.createTextNode(e):e)}),null!==n&&n.appendChild(o),o}

/**
 * 
 * @interface
 * @public
 * @class 
 */
class JpgSection
{
	/**
	 * Subsections, like header and body for each section. Or every single TAG inside the subsection IFD, inside the subsection APP1, inside the subsection Header
	 * @public 
	 * @type {Array} 
	 **/
	subsections = [];
	/**
	 * Attributes values of this section. Like a union (in C++) from the binary data present in the section.
	 * Every attribute has a key, a size in bytes and a description (for debug purposes)
	 * @public 
	 * @type {Object} 
	 **/
	attributes = {};
	/**
	 * To read uint16, uint32 and other data, every section will create a dataview from the given buffer
	 * @public 
	 * @type {DataView} 
	 **/
	view = null;
	/**
	 * Offset inside the binary file. Used only for debug 
	 * @public 
	 * @type {number} 
	 **/
	offset = 0;
	/**
	 * Name of this section. Used only for debug
	 * @public 
	 * @type {string} 
	 **/
	name = "??";
	/**
	 * Motorola use littleEndian to generate the JPG, Intel use bigEndian.
	 * @public 
	 * @type {number} 
	 **/
	bigEndian = true;
	
	/**
	 * Every section (ever the jpg itself) is a Section with subsections.
	 * A sections has other subsections and attributes (they are read sequentially in the binary file)
	 * - To show the entire JPG structure, you can parse recursively all subsections of each subsection.
	 * - To get the raw data of each section, you can read the attributes, they are a shadow of the binary file in the jpg.
	 * Every section has a byte array block to read. A DataView object is made to read the data from binary buffer.
	 * @constructor
	 * @class
	 * @param {ArrayBuffer} byteArray a buffer to read the data for this section
	 * @param {number} offset an offset inside the binary file, for debug.
	 * @param {string|null} name a name of this section, for debug
	 * @returns {JpgSection}
	 **/
	constructor(byteArray, offset, name)
	{
		if(byteArray) this.view = new DataView(byteArray);
		this.offset = offset;
		if(name) this.name = name;
	}
	/**
	 * Get the buffer of this section to generate a NEW JPG buffer
	 * @param {boolean} asByteArray if true, it returns a Uint8Array, else an ArrayBuffer
	 * @returns {Uint8Array|ArrayBuffer}
	 */
	getBuffer(asByteArray)
	{
		if(asByteArray)
		{
			return new Uint8Array(this.view.buffer);
		}
		return this.view.buffer;
	}
	
	/**
	 * Add an attribute to this section. Attributes are a sequence of different sized values from the binary file.
	 * If the same key is used more than once, the attribute will become an array.
	 * @param {string} key every attribute has a key to describe the value inside the section
	 * @param {number} size size in bytes of this attribute
	 * @param {string|null} description description of this attribute (for debug)
	 * @param {boolean|null} forceAscii the attribute should be read as an ASCII string
	 * @returns {undefined}
	 */
	addAttribute(key, size, description, forceAscii)
	{
			// detect the position in the buffer to read
		const offset = this.getAttributesSize();
		const newAttr = {
			value:this.#readAttribute(offset, size, forceAscii), 
			size, 
			description:description??key
		};
			// If the key was never used, create it. If it already exists, set this attribute to an array
		if(Array.isArray(this.attributes[key])) this.attributes[key].push(newAttr);
		else if(this.attributes[key]) this.attributes[key] = [this.attributes[key], newAttr];
		else this.attributes[key] = newAttr;
	}
	
	/**
	 * Returns the value of this attribute or the array (or string). If there are more than 1 values for this attribute an array is returned.
	 * @param {type} key
	 * @returns {number|Array|null}
	 */
	getAttribute(key)
	{
		if(this.attributes[key])
		{
			if(Array.isArray(this.attributes[key]))
			{
				let r = [];
				this.attributes[key].forEach(av=>{r.push(av?.value);});
				return r;
			}
			return this.attributes[key].value;
		}
		return null;
	}
	
	/**
	 * Read the attribute from binary buffer in the right way (string, number or array) and returns the value.
	 * @param {number} offset - offset to the buffer
	 * @param {number} size - number of bytes to read
	 * @param {boolean} forceAscii - set to true, if you want read it as ASCII string 
	 * @returns {number|Array|null}
	 */
	#readAttribute(offset, size, forceAscii)
	{
		if(forceAscii)
		{
			let r = ""; 
			for(let j=0;j<size;j++) 
				r += String.fromCharCode(this.view.getUint8(offset + j));
			return r;
		}
		switch(size)
		{
			case 1: return this.view.getUint8(offset);
			case 2: return this.view.getUint16(offset, !this.bigEndian);
			case 4: return this.view.getUint32(offset, !this.bigEndian);
			default: let r = []; 
							 for(let j=0;j<size;j++) 
								 r.push(this.view.getUint8(offset + j));
							 return r;
		}
	}
	
	/**
	 * Retrieve the size of all attributes inside the section. It is used also to find the next offset to read for a new attribute.
	 * @returns {number}
	 */
	getAttributesSize()
	{
		let size = 0;
		Object.keys(this.attributes).forEach(ak=>{
			size += this.attributes[ak].size;
		});
		return size;
	}
	
	/**
	 * Retrieve the size of this section. The parser should check if the offset at the end has the same value than manually add the size of this section.
	 * @returns {number}
	 */
	getSize()
	{
		return this.view.byteLength;
	}
};


/**
 * JPG constants. Every section can add some constants used to parse the block.
 * It can defines the size of the marker (normally 2 bytes), the value and add a description.
 * Note: the class is the class to use to generate or retrieve a new section (see jog/header/app1 folder)
 * @class
 * @constructor
 * @public
 */
class JpgConst
{
	BytesLen = 2;			// Bytes length for this variable/const
	Value = 0x0;			// Value
	Description = "";	// Description for Debug purposes
	Class = null;			// Class used for edit this variable/show const
	
	constructor(obj)
	{
		if(obj.size) this.BytesLen = obj.size;
		if(obj.value) this.Value = obj.value;
		if(obj.description) this.Description = obj.description;
		if(obj.class) this.Class = obj.class;
	}
};


/**
 * 
 * @augments JpgSection
 */
class JPG extends JpgSection
{
	#jpgHeader = null;
	#jpgBody = null;
	#promise = null;
	
	/**
	* The Object to create to parse a new image
	* This will open a link, File or arraybuffer to parse the content
	* @param {link|File|ArrayBuffer} image the image to open and parse
	* @class
	* @constructor
	* @public
	*/
	constructor(image)
	{
			// Call base constructor, with byte array (not available at this point), offset to the byte, and a description for debug purposes
		super(null, 0, "Jpeg");
				
			// Add constants used at this point
		JPGCONST['SOI'] = new JpgConst({value:0xFFD8, description:"Start Of Image"});
		JPGCONST['SOS'] = new JpgConst({value:0xFFDA, description:"Start Of Scan"});
		JPGCONST['EOI'] = new JpgConst({value:0xFFD9, description:"End Of Image"});
				
			// Open image and create subsections (head + body)
		this.#promise = new Promise((res,rej)=>{
			this.#open(image);
			let fails = 0;
			let ip = setInterval(()=>{
				if(this.subsections.length === 2) {res(); clearInterval(ip);}
				else if(fails++ > 20) {rej(); clearInterval(ip);}
			}, 100);
		});
	}
	
	open()
	{
		return this.#promise;
	}
	
		/** Returns a new generated array of the image, so you can save or show it on the webpage.
		 * @override
		 * @param {boolean} asByteArray - If true a byte array is returned. If false, a DataView with the buffer is returned.
		 * @returns {U[]|ArrayBuffer}
		 */
	getBuffer(asByteArray)
	{
		let buff = new ArrayBuffer(this.view.byteLength + 1024 * 1024); // big enough to store new data
		let dataView = new DataView(buff);
		let offset = 0;
		
		/**
		 * JPG format:
		 *  ----------------------------
		 * | Start Of Image  | 2 bytes |
		 *  ----------------------------
		 * | HEADER (EXIF)   | ? bytes |
		 *  ----------------------------
		 * | Start Of Stream | 2 bytes |
		 *  ----------------------------
		 * | BODY (JPG)      | ? bytes |
		 *  ----------------------------
		 * | End Of Image    | 2 bytes |
		 *  ----------------------------
		 */
		dataView.setUint16(offset, JPGCONST['SOI'].Value); offset += 2;
		this.subsections[0].getBuffer().forEach(b=>{dataView.setUint8(offset++, b);}); // header
		dataView.setUint16(offset, JPGCONST['SOS'].Value); offset += 2;
		this.subsections[1].getBuffer(true).forEach(b=>{dataView.setUint8(offset++, b);}); // body
		dataView.setUint16(offset, JPGCONST['EOI'].Value); offset += 2;
		
		if(asByteArray) return Array.from(new Uint8Array(buff.slice(0, offset)));
		return buff.slice(0, offset);
	}
	
	/**
	 * Return the original array buffer used to read the jpeg
	 * @returns {Uint8Array}
	 */
	getBinary()
	{
		return new Uint8Array(this.view.buffer);
	}
	
	/**
	 * Returns a specific Exif TAG. See jpgconst.js to find all possible tags
	 * @param {number} exifConst
	 * @returns {JpgTagSection|null}
	 */
	getExif(exifConst)
	{
		return this.#jpgHeader.getExif(exifConst);
	}
	
	/**
	 * Set the value of an exif or create it if it doesn't exists
	 * @param {number} exifConst - See jpgconst.js to find all possible tags
	 * @param {number|array} value - value to set in the exif
	 * @returns {JPGSection|null}
	 */
	setExif(exifConst, value)
	{
		return this.#jpgHeader.setExif(exifConst, value);
	}
	
	/**
	 * Returns the base offset to the IFD0, where everything should be read.
	 * @param {number} ifd (should be 0)
	 * @returns {number}
	 */
	getRationalBaseOffset(ifd)
	{
		return this.#jpgHeader.getRationalBaseOffset(ifd);
	}
	
	/**
	 * Open the image as base64, arraybuffer or file.
	 * It creates also the entire structure to parse every block/section inside the image
	 * @private
	 * @param {link|File|bufferArray} image
	 */
	#open(image)
	{
		const isFile = (input) => 'File' in window && input instanceof File;
		const isString = (typeof image === 'string');
		const isArray = Number.isInteger(image.byteLength);
	
		// A base64 is provided (or link?)
	  if(isString)
		{
			let blob = atob(image.substring(image.indexOf(",") + 1));
			const byteArrays = [];
			for (let i = 0; i < blob.length; i++) 
			{
					byteArrays.push(blob.charCodeAt(i));
			}
			const buff8 = new Uint8Array(byteArrays);
		  this.#open(buff8.buffer);
		}
		// A bufferArray is provided
		else if(isArray)
		{
			this.view = new DataView(image);
			if(this.view.getUint16(0) !== JPGCONST['SOI'].Value) throw new Error("This is not a JPEG (SOI missing)!");
			if(this.view.getUint16(this.view.byteLength - 2) !== JPGCONST['EOI'].Value) throw new Error("This is not a JPEG (EOI missing)!");
			let offset = 2;
			
			// find SOS
			while(this.view.getUint16(offset) !== JPGCONST['SOS'].Value)
			{
				offset += this.view.getUint16(offset + JPGCONST['SOS'].BytesLen) + JPGCONST['SOS'].BytesLen;
			}
			
			this.#jpgHeader = new JPGHeader(
				this.view.buffer.slice(JPGCONST['SOI'].BytesLen, offset), 
				JPGCONST['SOI'].BytesLen
			);
			
			this.#jpgBody = new JPGData(
				this.view.buffer.slice(offset + JPGCONST['SOS'].BytesLen, this.view.byteLength - JPGCONST['EOI'].BytesLen), 
				offset + JPGCONST['SOS'].BytesLen
			);
			
			this.addAttribute("SOI", 2, "Start Of Image");
			
			this.subsections.push(this.#jpgHeader);
			this.subsections.push(this.#jpgBody);
		}
		// A File is provided
		else if(isFile) 
		{
			var fr = new FileReader();
			fr.addEventListener("load", (im)=>{
				this.#open(im.target.result);
			});
			fr.readAsArrayBuffer(image);
		}
		// Unknown type, unable to read
		else
		{
			throw new Error("Unable to parse this kind of object at the moment");
		}
	}
};

// scripts used for subsections
scripts = [
	"jpg/jpgconst.js", 
	"jpg/jpgdata.js", 
	"jpg/jpgheader.js"
].forEach(s=>{
	_CN("script", {src:s, type:"text/javascript"}, [], document.head);
});

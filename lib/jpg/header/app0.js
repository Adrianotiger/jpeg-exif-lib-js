// this is the JFIF Tag
// https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format


class JPGApp0 extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "app0 JFIF");
		
		JPGCONST['JFIF']  = new JpgConst({value:0x4A46494600, description:"JFIF Identifier"});
		JPGCONST['JFXX']  = new JpgConst({value:0x4A46585800, description:"JFXX Identifier"});
		
		this.addAttribute("sectionId", JPGCONST['APP0'].BytesLen, "section ID");
		this.addAttribute("sectionSize", JPGCONST['APP0'].BytesLen, "section size");
		this.addAttribute("identifier", 5, "App0 Identifier", true);
				
		if(this.getAttribute("identifier") === "JFIF\0") // JFIF
		{
			this.addAttribute("versionMajor", 1);
			this.addAttribute("versionMinor", 1);
			this.addAttribute("density", 1, "density units");
			this.addAttribute("densityX", 2, "density X");
			this.addAttribute("densityY", 2, "density Y");
			this.addAttribute("thumbnailX", 1, "thumbnail X");
			this.addAttribute("thumbnailY", 1, "thumbnail Y");
			this.addAttribute("thumbnailData", 3 * this.getAttribute("thumbnailX") * this.getAttribute("thumbnailY"));
						
			// Checks and Warnings
			if(this.getAttribute("density") > 2) console.warn(`Density units should be 0, 1 or 2! Nor ${this.getAttribute("density")}`);
		}
		else if(this.getAttribute("identifier") === "JFXX\0") // JFXX
		{
			console.error("JFXX not implemented yet");
		}
		else
		{
			console.error(`Unknown identifier for App0: ${this.getAttribute("identifier")}`);
		}
		
		if(this.getAttributesSize() !== buffer.byteLength) console.warn(`End offset didn't reached the size of the buffer`);
	}
};
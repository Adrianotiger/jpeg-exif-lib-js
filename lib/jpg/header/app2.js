class JPGApp2 extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "app2");

		/**
		 * JPG\Headers\app0 format:
		 *  ----------------------------
		 * | Marker ID       | 2 bytes | << App2 
		 *  ----------------------------
		 * | Marker Size     | 2 bytes |
		 *  ----------------------------
		 * | Identifier      |12 bytes |  << Only ICC_PROFILE supported at the moment
		 *  ----------------------------
		 * | chunkIndex      | 1 bytes |
		 *  ----------------------------
		 * | chunkCound      | 1 bytes |
		 *  ----------------------------
		 * | ICC Prof. Data  | ? bytes |
		 *  ----------------------------
		 */

		this.addAttribute("sectionId", JPGCONST['APP2'].BytesLen, "section ID");
		this.addAttribute("sectionSize", JPGCONST['APP2'].BytesLen, "section size");

		let jEnd = JPGCONST['APP2'].BytesLen * 2;
		for(;jEnd < 20;jEnd++) // shound not be more than 20 bytes.
		{
			if(this.view.getUint8(jEnd) == 0) break;
		}
		this.addAttribute("identifier", jEnd + 1 - JPGCONST['APP2'].BytesLen * 2, "App2 Identifier", true);
		this.addAttribute("chunkIndex", 1, "Chunk index");
		this.addAttribute("chunkCount", 1, "Chunk count");

		const dataLen = buffer.maxByteLength - this.getAttributesSize();

		this.addAttribute("profileData", dataLen, "ICC Profile Data");
	}
};
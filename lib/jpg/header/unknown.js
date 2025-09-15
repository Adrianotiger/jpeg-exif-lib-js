class JPGUnknown extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "Unknown");
		
		console.warn(`Unknown marker 0x${this.view.getUint16(0).toString(16)} - Size: ${buffer.byteLength}, at Offset ${offset}`);
	}
};
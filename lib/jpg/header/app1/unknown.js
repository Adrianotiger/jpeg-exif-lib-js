class JPGTagUnknown extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Unknown TAG " + name, bigEndian);
		
		console.warn(`Unknown TAG 0x${this.view.getUint16(0, !bigEndian).toString(16)} - Size: ${buffer.byteLength}, at Offset ${offset}`);
	}
};
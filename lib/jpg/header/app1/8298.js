class JPGTag8298 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		if(!buffer) 
		{
						   /*     TAG ,      ASCII,                 0 bytes,   \0*/
			const newTag = [0x82, 0x98, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
			buffer = (new Uint8Array(newTag)).buffer;
		}

		super(buffer, offset, "Copyright (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
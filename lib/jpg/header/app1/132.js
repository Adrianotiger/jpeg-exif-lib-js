
class JPGTag132 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		if(!buffer) 
		{
							       /*     TAG ,      ASCII,                 0 bytes,   \0*/
			const newTag = [0x01, 0x32, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
			buffer = (new Uint8Array(newTag)).buffer;
		}
		
		super(buffer, offset, "DateTime (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
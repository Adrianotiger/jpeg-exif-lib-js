
class JPGTag131 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	// Unit of XResolution(0x011a)/YResolution(0x011b). '1' means no-unit, '2' means inch, '3' means centimeter.
	constructor(buffer, offset, name, bigEndian)
	{
		if(!buffer) 
		{
							/*     TAG ,      ASCII,                 2 bytes,   A\0\0\0*/
			const newTag = [0x01, 0x31, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x41, 0x00, 0x00, 0x00];
			buffer = (new Uint8Array(newTag)).buffer;
		}
		super(buffer, offset, "Software (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
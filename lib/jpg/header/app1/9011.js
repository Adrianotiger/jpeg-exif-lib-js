class JPGTag9011 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "OffsetTime (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
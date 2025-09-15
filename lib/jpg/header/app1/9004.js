class JPGTag9004 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "DateTimeDigitized (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
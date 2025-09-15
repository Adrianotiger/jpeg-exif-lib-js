class JPGTag9202 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ApertureValue (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
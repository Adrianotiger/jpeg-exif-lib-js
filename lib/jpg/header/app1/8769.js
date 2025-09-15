class JPGTag8769 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "SubIFD (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
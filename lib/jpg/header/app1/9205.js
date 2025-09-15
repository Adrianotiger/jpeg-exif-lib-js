class JPGTag9205 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "MaxApertureValue (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
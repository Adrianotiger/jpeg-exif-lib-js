class JPGTag9203 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "BrightnessValue (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
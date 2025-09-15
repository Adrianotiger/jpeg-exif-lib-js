class JPGTag9201 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ShutterSpeedValue (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
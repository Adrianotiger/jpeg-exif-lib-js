class JPGTag9101 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ComponentsConfiguration (" + name + ")", bigEndian);
		
		this.TagType = "number";			
	}
};
class JPGTag8298 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Copyright (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
class JPGTag9003 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "DateTimeOriginal (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
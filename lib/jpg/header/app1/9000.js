class JPGTag9000 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ExifVersion (" + name + ")", bigEndian);
		
		this.TagType = "string";			
	}
};
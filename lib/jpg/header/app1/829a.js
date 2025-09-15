class JPGTag829a extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ExposureTime (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
class JPGTag2 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "InteropVersion (" + name + ")", bigEndian);
		
		this.TagType = "string";
	}
};
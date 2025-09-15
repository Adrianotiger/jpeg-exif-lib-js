class JPGTag10f extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Make (" + name + ")", bigEndian);
		
		this.TagType = "string";
	}
};
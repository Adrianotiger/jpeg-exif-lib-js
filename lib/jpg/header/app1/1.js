class JPGTag1 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "InteropIndex (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
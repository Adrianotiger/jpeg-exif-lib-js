class JPGTag100 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ImageWidth (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
class JPGTag213 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "YCbCrPositioning (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
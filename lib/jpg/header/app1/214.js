class JPGTag214 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ReferenceBlackWhite (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
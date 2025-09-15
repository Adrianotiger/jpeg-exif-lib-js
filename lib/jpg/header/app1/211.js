class JPGTag211 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "YCbCrCoefficients (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
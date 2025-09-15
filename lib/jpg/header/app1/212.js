class JPGTag212 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "YCbCrSubSampling (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
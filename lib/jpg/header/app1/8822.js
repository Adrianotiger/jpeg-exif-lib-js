class JPGTag8822 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ExposureProgram (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
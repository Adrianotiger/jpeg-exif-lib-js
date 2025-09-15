class JPGTag8827 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ISOSpeedRating (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
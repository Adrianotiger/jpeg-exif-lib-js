class JPGTag8825 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "GPS Info (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
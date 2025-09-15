class JPGTag110 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Model (" + name + ")", bigEndian);
		
		this.TagType = "string";
	}
};
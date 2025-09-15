class JPGTag101 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ImageHeight (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};
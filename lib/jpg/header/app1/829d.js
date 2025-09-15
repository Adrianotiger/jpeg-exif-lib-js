class JPGTag829d extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Focal Number (" + name + ")", bigEndian);
		
		this.TagType = "number";
	}
};